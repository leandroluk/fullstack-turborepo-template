// src/shared/types.ts
import type * as k8s from '@pulumi/kubernetes';
import type * as pulumi from '@pulumi/pulumi';

export type ProviderName = 'local' | 'aws' | 'gcp' | 'baremetal';

/** Result returned by every cluster bootstrap function */
export interface ClusterResult {
  /** Kubernetes provider configured for the cluster */
  k8sProvider: k8s.Provider;
  /** Raw kubeconfig (or placeholder for local) */
  kubeconfig: pulumi.Output<any>;
  /** Cloud-specific outputs — undefined when not applicable */
  vpcId?: pulumi.Output<string>;
  gkeClusterName?: pulumi.Output<string>;
}

/**
 * S3-compatible storage credentials injected into every app pod.
 * MinIO (local/baremetal) and AWS S3 / GCP GCS (via HMAC interop) all use the
 * same variable names so application code is provider-agnostic.
 */
export interface StorageSecret {
  /** Kubernetes Secret resource */
  secret: k8s.core.v1.Secret;
  /** Name of the secret to reference in envFrom */
  secretName: pulumi.Output<string>;
}
