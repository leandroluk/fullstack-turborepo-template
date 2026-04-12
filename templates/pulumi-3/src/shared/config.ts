// src/shared/config.ts
import * as pulumi from '@pulumi/pulumi';
import type {ProviderName} from './types.js';

const config = new pulumi.Config();

// ── Provider selection ────────────────────────────────────────────────────────
// Accepted values: "local" | "aws" | "gcp" | "baremetal"
export const providerName = (config.get('provider') ?? 'local') as ProviderName;

// ── Base domain ───────────────────────────────────────────────────────────────
export const baseDomain = config.get('baseDomain') ?? '127.0.0.1.nip.io';

// ── Application images ────────────────────────────────────────────────────────
export const apiImage = config.get('apiImage') ?? 'localhost:5000/api:latest';
export const webImage = config.get('webImage') ?? 'localhost:5000/web:latest';
export const docImage = config.get('docImage') ?? 'localhost:5000/doc:latest';

// ── Replica counts ────────────────────────────────────────────────────────────
export const apiReplicas = config.getNumber('apiReplicas') ?? 1;
export const webReplicas = config.getNumber('webReplicas') ?? 1;
export const docReplicas = config.getNumber('docReplicas') ?? 1;

// ── PostgreSQL ────────────────────────────────────────────────────────────────
export const postgresUser = config.get('postgresUser') ?? 'postgres';
export const postgresPassword = config.getSecret('postgresPassword') ?? pulumi.output('postgres');
export const postgresDb = config.get('postgresDb') ?? 'app';

// ── Redis ─────────────────────────────────────────────────────────────────────
export const redisPassword = config.getSecret('redisPassword') ?? pulumi.output('');

// ── MinIO (local / baremetal only) ───────────────────────────────────────────
export const minioRootUser = config.get('minioRootUser') ?? 'minioadmin';
export const minioRootPassword = config.getSecret('minioRootPassword') ?? pulumi.output('minioadmin');
export const minioBucket = config.get('minioBucket') ?? 'app';

// ── AWS (production) ──────────────────────────────────────────────────────────
export const awsRegion = config.get('awsRegion') ?? 'us-east-1';
export const awsS3Bucket = config.get('awsS3Bucket') ?? '';
export const eksNodeInstanceType = config.get('eksNodeInstanceType') ?? 't3.medium';
export const desiredClusterSize = config.getNumber('desiredClusterSize') ?? 2;
export const minClusterSize = config.getNumber('minClusterSize') ?? 1;
export const maxClusterSize = config.getNumber('maxClusterSize') ?? 10;
export const vpcNetworkCidr = config.get('vpcNetworkCidr') ?? '10.0.0.0/16';

// ── GCP (production) ──────────────────────────────────────────────────────────
export const gcpProject = config.get('gcpProject') ?? '';
export const gcpRegion = config.get('gcpRegion') ?? 'us-central1';
export const gcpZone = config.get('gcpZone') ?? 'us-central1-a';
export const gcpGcsBucket = config.get('gcpGcsBucket') ?? '';
export const gkeMachineType = config.get('gkeMachineType') ?? 'e2-standard-2';
export const gkeInitialNodeCount = config.getNumber('gkeInitialNodeCount') ?? 2;
export const gkeMinNodeCount = config.getNumber('gkeMinNodeCount') ?? 1;
export const gkeMaxNodeCount = config.getNumber('gkeMaxNodeCount') ?? 10;

// ── Baremetal ────────────────────────────────────────────────────────────────
// Space-separated list of IPs for MetalLB address pool e.g. "192.168.1.200-192.168.1.210"
export const metallbAddressPool = config.get('metallbAddressPool') ?? '192.168.1.200-192.168.1.210';
// Storage class to use for PVCs (e.g. "local-path", "longhorn", "nfs-client")
export const storageClass = config.get('storageClass') ?? 'local-path';
