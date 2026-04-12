// src/shared/apps.ts
import * as k8s from '@pulumi/kubernetes';
import type * as pulumi from '@pulumi/pulumi';

interface AppDeploymentArgs {
  provider: k8s.Provider;
  namespace: pulumi.Input<string>;
  name: string;
  image: string;
  replicas: pulumi.Input<number>;
  port: number;
  env?: k8s.types.input.core.v1.EnvVar[];
  envFromSecrets?: pulumi.Input<string>[];
}

function createAppDeployment(args: AppDeploymentArgs): k8s.core.v1.Service {
  const {provider, namespace, name, image, replicas, port, env = [], envFromSecrets = []} = args;

  const labels = {app: name};

  const finalEnv = [...env, {name: 'PORT', value: port.toString()}];

  new k8s.apps.v1.Deployment(
    `${name}-deployment`,
    {
      metadata: {name, namespace},
      spec: {
        replicas,
        selector: {matchLabels: labels},
        template: {
          metadata: {labels},
          spec: {
            containers: [
              {
                name,
                image,
                imagePullPolicy: 'IfNotPresent',
                ports: [{containerPort: port}],
                env: finalEnv,
                envFrom: envFromSecrets.map(secretName => ({secretRef: {name: secretName}})),
                resources: {
                  requests: {cpu: '50m', memory: '128Mi'},
                  limits: {cpu: '500m', memory: '512Mi'},
                },
                readinessProbe: {
                  httpGet: {path: '/health', port},
                  initialDelaySeconds: 10,
                  periodSeconds: 10,
                  failureThreshold: 3,
                },
                livenessProbe: {
                  httpGet: {path: '/health', port},
                  initialDelaySeconds: 30,
                  periodSeconds: 20,
                  failureThreshold: 5,
                },
              },
            ],
          },
        },
      },
    },
    {provider}
  );

  return new k8s.core.v1.Service(
    `${name}-svc`,
    {
      metadata: {name: `${name}-svc`, namespace},
      spec: {
        selector: labels,
        ports: [{port, targetPort: port}],
        type: 'ClusterIP',
      },
    },
    {provider}
  );
}
export interface AppsArgs {
  provider: k8s.Provider;
  namespace: pulumi.Input<string>;
  apiImage: string;
  webImage: string;
  docImage: string;
  apiReplicas: number;
  webReplicas: number;
  docReplicas: number;
  postgresSecretName: pulumi.Input<string>;
  redisSecretName: pulumi.Input<string>;
  storageSecretName: pulumi.Input<string>;
}

export function createApps(args: AppsArgs): {
  apiSvc: k8s.core.v1.Service;
  webSvc: k8s.core.v1.Service;
  docSvc: k8s.core.v1.Service;
} {
  const {
    provider,
    namespace,
    apiImage,
    webImage,
    docImage,
    apiReplicas,
    webReplicas,
    docReplicas,
    postgresSecretName,
    redisSecretName,
    storageSecretName,
  } = args;

  // API — receives all secrets (DB, cache, storage)
  const apiSvc = createAppDeployment({
    provider,
    namespace,
    name: 'api',
    image: apiImage,
    replicas: apiReplicas,
    port: 3333,
    envFromSecrets: [postgresSecretName, redisSecretName, storageSecretName],
    env: [
      {name: 'NODE_ENV', value: 'production'},
      {name: 'PORT', value: '3333'},
    ],
  });

  // Web — only needs the API URL and storage (for direct uploads if applicable)
  const webSvc = createAppDeployment({
    provider,
    namespace,
    name: 'web',
    image: webImage,
    replicas: webReplicas,
    port: 3000,
    envFromSecrets: [storageSecretName],
    env: [
      {name: 'NODE_ENV', value: 'production'},
      {name: 'PORT', value: '3000'},
      {name: 'NEXT_PUBLIC_API_URL', value: 'http://api-svc:3333'},
    ],
  });

  // Doc — static-ish, no secrets needed
  const docSvc = createAppDeployment({
    provider,
    namespace,
    name: 'doc',
    image: docImage,
    replicas: docReplicas,
    port: 3001,
    env: [
      {name: 'NODE_ENV', value: 'production'},
      {name: 'PORT', value: '3001'},
    ],
  });

  return {apiSvc, webSvc, docSvc};
}
