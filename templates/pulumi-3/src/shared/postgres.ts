// src/shared/postgres.ts
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

interface PostgresArgs {
  provider: k8s.Provider;
  namespace: pulumi.Input<string>;
  user: string;
  password: pulumi.Output<string>;
  database: string;
  /** Storage class for PVC. Undefined = use cluster default. */
  storageClass?: string;
}

export function createPostgres(args: PostgresArgs): {
  secret: k8s.core.v1.Secret;
  service: k8s.core.v1.Service;
} {
  const {provider, namespace, user, password, database, storageClass} = args;

  const secret = new k8s.core.v1.Secret(
    'postgres-secret',
    {
      metadata: {name: 'postgres-secret', namespace},
      stringData: {
        POSTGRES_USER: user,
        POSTGRES_PASSWORD: password,
        POSTGRES_DB: database,
        DATABASE_URL: pulumi.interpolate`postgresql://${user}:${password}@postgres-svc:5432/${database}`,
      },
    },
    {provider}
  );

  new k8s.apps.v1.StatefulSet(
    'postgres',
    {
      metadata: {name: 'postgres', namespace},
      spec: {
        serviceName: 'postgres-svc',
        replicas: 1,
        selector: {matchLabels: {app: 'postgres'}},
        template: {
          metadata: {labels: {app: 'postgres'}},
          spec: {
            containers: [
              {
                name: 'postgres',
                image: 'postgres:16-alpine',
                ports: [{containerPort: 5432}],
                envFrom: [{secretRef: {name: 'postgres-secret'}}],
                volumeMounts: [{name: 'postgres-data', mountPath: '/var/lib/postgresql/data'}],
                resources: {
                  requests: {cpu: '100m', memory: '256Mi'},
                  limits: {cpu: '500m', memory: '512Mi'},
                },
                readinessProbe: {
                  exec: {command: ['pg_isready', '-U', user, '-d', database]},
                  initialDelaySeconds: 5,
                  periodSeconds: 10,
                },
                livenessProbe: {
                  exec: {command: ['pg_isready', '-U', user, '-d', database]},
                  initialDelaySeconds: 30,
                  periodSeconds: 20,
                },
              },
            ],
          },
        },
        volumeClaimTemplates: [
          {
            metadata: {name: 'postgres-data'},
            spec: {
              accessModes: ['ReadWriteOnce'],
              ...(storageClass ? {storageClassName: storageClass} : {}),
              resources: {requests: {storage: '5Gi'}},
            },
          },
        ],
      },
    },
    {provider, dependsOn: [secret]}
  );

  const service = new k8s.core.v1.Service(
    'postgres-svc',
    {
      metadata: {name: 'postgres-svc', namespace},
      spec: {
        selector: {app: 'postgres'},
        ports: [{port: 5432, targetPort: 5432}],
        clusterIP: 'None',
      },
    },
    {provider}
  );

  return {secret, service};
}
