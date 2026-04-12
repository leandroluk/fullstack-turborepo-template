// src/shared/storage-secret.ts
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import type {StorageSecret} from './types.js';

/**
 * Creates a Secret with S3-compatible vars pointing to AWS S3.
 * Apps use the same env var names regardless of provider.
 */
export function createAwsStorageSecret(args: {
  provider: k8s.Provider;
  namespace: pulumi.Input<string>;
  bucket: string;
  region: string;
  /** IAM access key — prefer IRSA in production (leave empty to use node role) */
  accessKey?: pulumi.Output<string>;
  secretKey?: pulumi.Output<string>;
}): StorageSecret {
  const {provider, namespace, bucket, region, accessKey, secretKey} = args;

  const secret = new k8s.core.v1.Secret(
    'storage-secret',
    {
      metadata: {name: 'storage-secret', namespace},
      stringData: {
        S3_ENDPOINT: `https://s3.${region}.amazonaws.com`,
        S3_BUCKET: bucket,
        S3_ACCESS_KEY: accessKey ?? pulumi.output(''),
        S3_SECRET_KEY: secretKey ?? pulumi.output(''),
        S3_REGION: region,
        S3_USE_SSL: 'true',
      },
    },
    {provider}
  );

  return {secret, secretName: secret.metadata.name};
}

/**
 * Creates a Secret with S3-compatible vars pointing to GCS via HMAC interoperability.
 * Enable HMAC keys in GCS: https://cloud.google.com/storage/docs/authentication/hmackeys
 */
export function createGcpStorageSecret(args: {
  provider: k8s.Provider;
  namespace: pulumi.Input<string>;
  bucket: string;
  hmacAccessKey: pulumi.Output<string>;
  hmacSecretKey: pulumi.Output<string>;
}): StorageSecret {
  const {provider, namespace, bucket, hmacAccessKey, hmacSecretKey} = args;

  const secret = new k8s.core.v1.Secret(
    'storage-secret',
    {
      metadata: {name: 'storage-secret', namespace},
      stringData: {
        // GCS S3-interop endpoint
        S3_ENDPOINT: 'https://storage.googleapis.com',
        S3_BUCKET: bucket,
        S3_ACCESS_KEY: hmacAccessKey,
        S3_SECRET_KEY: hmacSecretKey,
        S3_REGION: 'auto',
        S3_USE_SSL: 'true',
      },
    },
    {provider}
  );

  return {secret, secretName: secret.metadata.name};
}
