// src/index.ts
/**
 * fullstack-turborepo-template · k8s
 *
 * Supports four providers via `k8s:provider` config:
 *
 *   "local"     → k3d + local registry (localhost:5000) + MinIO
 *   "aws"       → EKS + S3
 *   "gcp"       → GKE + GCS (S3-interop)
 *   "baremetal" → existing cluster + MetalLB + MinIO
 *
 * All providers deploy the same application workloads (api, web, doc),
 * PostgreSQL, Redis, NGINX Ingress, and expose S3-compatible env vars to pods.
 */

import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

import {createMetalLB} from './baremetal/metallb.js';
import {createApps} from './shared/apps.js';
import {
  apiImage,
  apiReplicas,
  awsRegion,
  awsS3Bucket,
  baseDomain,
  docImage,
  docReplicas,
  gcpGcsBucket,
  metallbAddressPool,
  minioBucket,
  minioRootPassword,
  minioRootUser,
  postgresDb,
  postgresPassword,
  postgresUser,
  providerName,
  redisPassword,
  storageClass,
  webImage,
  webReplicas,
} from './shared/config.js';
import {createIngress, createIngressController} from './shared/ingress.js';
import {createMinio, createMinioBucketJob} from './shared/minio.js';
import {createNamespace} from './shared/namespace.js';
import {createPostgres} from './shared/postgres.js';
import {createRedis} from './shared/redis.js';
import {createAwsStorageSecret, createGcpStorageSecret} from './shared/storage-secret.js';
import type {ClusterResult, StorageSecret} from './shared/types.js';

// ── 1. Cluster bootstrap ──────────────────────────────────────────────────────

let clusterResult: ClusterResult;

switch (providerName) {
  case 'aws': {
    const {createCluster} = await import('./aws/cluster.js');
    clusterResult = createCluster();
    break;
  }
  case 'gcp': {
    const {createCluster} = await import('./gcp/cluster.js');
    clusterResult = createCluster();
    break;
  }
  case 'local':
  case 'baremetal':
  default: {
    // Cluster already exists — use the active kubeconfig context
    clusterResult = {
      k8sProvider: new k8s.Provider('local-provider', {
        suppressDeprecationWarnings: true,
      }),
      kubeconfig: pulumi.output('using-default-local-context'),
    };
    break;
  }
}

const {k8sProvider} = clusterResult;

// ── 2. Namespace ──────────────────────────────────────────────────────────────

const ns = createNamespace(k8sProvider);
const namespace = ns.metadata.name;

// ── 3. Baremetal extras (MetalLB) ─────────────────────────────────────────────

const metallbDeps: pulumi.Resource[] = [];

if (providerName === 'baremetal') {
  const {release, advertisement} = createMetalLB(k8sProvider, metallbAddressPool);
  metallbDeps.push(release, advertisement);
}

// ── 4. NGINX Ingress Controller ───────────────────────────────────────────────

const ingressController = createIngressController(k8sProvider, providerName, metallbDeps);

// ── 5. PostgreSQL ─────────────────────────────────────────────────────────────

const {secret: pgSecret} = createPostgres({
  provider: k8sProvider,
  namespace,
  user: postgresUser,
  password: postgresPassword,
  database: postgresDb,
  storageClass: providerName === 'baremetal' ? storageClass : undefined,
});

// ── 6. Redis ──────────────────────────────────────────────────────────────────

const {secret: redisSecret} = createRedis({
  provider: k8sProvider,
  namespace,
  password: redisPassword,
  storageClass: providerName === 'baremetal' ? storageClass : undefined,
});

// ── 7. Storage (provider-specific) ───────────────────────────────────────────

let storageSecret: StorageSecret;

switch (providerName) {
  case 'aws': {
    storageSecret = createAwsStorageSecret({
      provider: k8sProvider,
      namespace,
      bucket: awsS3Bucket,
      region: awsRegion,
    });
    break;
  }
  case 'gcp': {
    // GCS HMAC keys must be set via:
    //   pulumi config set --secret k8s:gcpHmacAccessKey <key>
    //   pulumi config set --secret k8s:gcpHmacSecretKey <secret>
    const cfg = new pulumi.Config();
    storageSecret = createGcpStorageSecret({
      provider: k8sProvider,
      namespace,
      bucket: gcpGcsBucket,
      hmacAccessKey: cfg.getSecret('gcpHmacAccessKey') ?? pulumi.output(''),
      hmacSecretKey: cfg.getSecret('gcpHmacSecretKey') ?? pulumi.output(''),
    });
    break;
  }
  case 'local':
  case 'baremetal':
  default: {
    const {storageSecret: minioStorageSecret, apiService: minioSvc} = createMinio({
      provider: k8sProvider,
      namespace,
      rootUser: minioRootUser,
      rootPassword: minioRootPassword,
      bucket: minioBucket,
      storageClass: providerName === 'baremetal' ? storageClass : undefined,
      baseDomain,
    });

    // Job that creates the default bucket after MinIO is ready
    createMinioBucketJob({
      provider: k8sProvider,
      namespace,
      bucket: minioBucket,
      dependsOn: [minioSvc],
    });

    storageSecret = minioStorageSecret;
    break;
  }
}

// ── 8. Application workloads ──────────────────────────────────────────────────

createApps({
  provider: k8sProvider,
  namespace,
  apiImage,
  webImage,
  docImage,
  apiReplicas,
  webReplicas,
  docReplicas,
  postgresSecretName: pgSecret.metadata.name,
  redisSecretName: redisSecret.metadata.name,
  storageSecretName: storageSecret.secretName,
});

// ── 9. Ingress routing ────────────────────────────────────────────────────────

createIngress(k8sProvider, namespace, baseDomain, ingressController);

// ── Exports ───────────────────────────────────────────────────────────────────

export const {kubeconfig, vpcId, gkeClusterName} = clusterResult;

export const urls = {
  api: `http://api.${baseDomain}`,
  web: `http://web.${baseDomain}`,
  doc: `http://doc.${baseDomain}`,
  ...(providerName === 'local' || providerName === 'baremetal' ? {minio: `http://minio.${baseDomain}`} : {}),
};
