// src/shared/minio.ts
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import type {StorageSecret} from './types.js';

interface MinioArgs {
  provider: k8s.Provider;
  namespace: pulumi.Input<string>;
  rootUser: pulumi.Input<string>;
  rootPassword: pulumi.Output<string>;
  bucket: string;
  /** Storage class for PVC. Undefined = use cluster default. */
  storageClass?: string;
  /** Expose the MinIO console via Ingress at minio.<baseDomain> */
  baseDomain?: string;
}

/**
 * Deploys MinIO as a single-node StatefulSet with:
 *  - PersistentVolumeClaim for object data
 *  - Secret with S3-compatible env vars (shared with all app pods)
 *  - Headless Service for the S3 API  (port 9000)
 *  - ClusterIP Service for the web console (port 9001)
 *
 * The secret exposes:
 *   S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY, S3_REGION, S3_USE_SSL
 *
 * App code only needs to read these vars — no MinIO SDK required.
 */
export function createMinio(args: MinioArgs): {
  storageSecret: StorageSecret;
  apiService: k8s.core.v1.Service;
  consoleService: k8s.core.v1.Service;
} {
  const {provider, namespace, rootUser, rootPassword, bucket, storageClass, baseDomain} = args;

  // ── Secret (S3-compatible vars) ──────────────────────────────────────────
  const secret = new k8s.core.v1.Secret(
    'minio-secret',
    {
      metadata: {name: 'minio-secret', namespace},
      stringData: {
        // MinIO server vars
        MINIO_ROOT_USER: rootUser,
        MINIO_ROOT_PASSWORD: rootPassword,
        // S3-compatible vars consumed by application code
        S3_ENDPOINT: 'http://minio-svc:9000',
        S3_BUCKET: bucket,
        S3_ACCESS_KEY: rootUser,
        S3_SECRET_KEY: rootPassword,
        S3_REGION: 'us-east-1', // MinIO ignores this but SDKs may require it
        S3_USE_SSL: 'false',
      },
    },
    {provider}
  );

  // ── StatefulSet ──────────────────────────────────────────────────────────
  new k8s.apps.v1.StatefulSet(
    'minio',
    {
      metadata: {name: 'minio', namespace},
      spec: {
        serviceName: 'minio-svc',
        replicas: 1,
        selector: {matchLabels: {app: 'minio'}},
        template: {
          metadata: {labels: {app: 'minio'}},
          spec: {
            containers: [
              {
                name: 'minio',
                image: 'minio/minio:latest',
                args: ['server', '/data', '--console-address', ':9001'],
                ports: [
                  {name: 'api', containerPort: 9000},
                  {name: 'console', containerPort: 9001},
                ],
                envFrom: [{secretRef: {name: 'minio-secret'}}],
                volumeMounts: [{name: 'minio-data', mountPath: '/data'}],
                resources: {
                  requests: {cpu: '100m', memory: '256Mi'},
                  limits: {cpu: '500m', memory: '1Gi'},
                },
                readinessProbe: {
                  httpGet: {path: '/minio/health/ready', port: 9000},
                  initialDelaySeconds: 10,
                  periodSeconds: 10,
                },
                livenessProbe: {
                  httpGet: {path: '/minio/health/live', port: 9000},
                  initialDelaySeconds: 20,
                  periodSeconds: 20,
                },
              },
            ],
          },
        },
        volumeClaimTemplates: [
          {
            metadata: {name: 'minio-data'},
            spec: {
              accessModes: ['ReadWriteOnce'],
              ...(storageClass ? {storageClassName: storageClass} : {}),
              resources: {requests: {storage: '10Gi'}},
            },
          },
        ],
      },
    },
    {provider, dependsOn: [secret]}
  );

  // ── Services ─────────────────────────────────────────────────────────────
  // Headless for StatefulSet DNS (S3 API)
  const apiService = new k8s.core.v1.Service(
    'minio-svc',
    {
      metadata: {name: 'minio-svc', namespace},
      spec: {
        selector: {app: 'minio'},
        ports: [{name: 'api', port: 9000, targetPort: 9000}],
        clusterIP: 'None',
      },
    },
    {provider}
  );

  // ClusterIP for the web console
  const consoleService = new k8s.core.v1.Service(
    'minio-console-svc',
    {
      metadata: {name: 'minio-console-svc', namespace},
      spec: {
        selector: {app: 'minio'},
        ports: [{name: 'console', port: 9001, targetPort: 9001}],
        type: 'ClusterIP',
      },
    },
    {provider}
  );

  // ── Optional: Ingress for the console ─────────────────────────────────────
  if (baseDomain) {
    new k8s.networking.v1.Ingress(
      'minio-console-ingress',
      {
        metadata: {
          name: 'minio-console-ingress',
          namespace,
          annotations: {
            'kubernetes.io/ingress.class': 'nginx',
            'nginx.ingress.kubernetes.io/proxy-body-size': '0', // unlimited for uploads
          },
        },
        spec: {
          rules: [
            {
              host: `minio.${baseDomain}`,
              http: {
                paths: [
                  {
                    path: '/',
                    pathType: 'Prefix',
                    backend: {
                      service: {name: 'minio-console-svc', port: {number: 9001}},
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {provider}
    );
  }

  return {
    storageSecret: {
      secret,
      secretName: secret.metadata.name,
    },
    apiService,
    consoleService,
  };
}

/**
 * Creates a Job that waits for MinIO to be ready then creates the default bucket.
 * Uses the MinIO Client (mc) image.
 */
export function createMinioBucketJob(args: {
  provider: k8s.Provider;
  namespace: pulumi.Input<string>;
  bucket: string;
  dependsOn: pulumi.Resource[];
}): k8s.batch.v1.Job {
  const {provider, namespace, bucket, dependsOn} = args;

  return new k8s.batch.v1.Job(
    'minio-create-bucket',
    {
      metadata: {name: 'minio-create-bucket', namespace},
      spec: {
        template: {
          spec: {
            restartPolicy: 'OnFailure',
            containers: [
              {
                name: 'mc',
                image: 'minio/mc:latest',
                command: ['sh', '-c'],
                args: [
                  [
                    'until mc alias set local http://minio-svc:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"; do echo waiting for minio; sleep 2; done',
                    `mc mb --ignore-existing local/${bucket}`,
                    `mc anonymous set download local/${bucket}`,
                    'echo "Bucket ready."',
                  ].join(' && '),
                ],
                envFrom: [{secretRef: {name: 'minio-secret'}}],
              },
            ],
          },
        },
        backoffLimit: 10,
      },
    },
    {provider, dependsOn}
  );
}
