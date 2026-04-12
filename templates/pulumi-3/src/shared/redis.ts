// src/shared/redis.ts
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

interface RedisArgs {
  provider: k8s.Provider;
  namespace: pulumi.Input<string>;
  password: pulumi.Output<string>;
  /** Storage class for PVC. Undefined = use cluster default. */
  storageClass?: string;
}

export function createRedis(args: RedisArgs): {
  secret: k8s.core.v1.Secret;
  service: k8s.core.v1.Service;
} {
  const {provider, namespace, password, storageClass} = args;

  const secret = new k8s.core.v1.Secret(
    'redis-secret',
    {
      metadata: {name: 'redis-secret', namespace},
      stringData: {
        REDIS_PASSWORD: password,
        REDIS_URL: pulumi.interpolate`redis://:${password}@redis-svc:6379`,
      },
    },
    {provider}
  );

  const redisCommand = password.apply(pwd =>
    pwd ? ['redis-server', '--requirepass', pwd, '--appendonly', 'yes'] : ['redis-server', '--appendonly', 'yes']
  );

  new k8s.apps.v1.StatefulSet(
    'redis',
    {
      metadata: {name: 'redis', namespace},
      spec: {
        serviceName: 'redis-svc',
        replicas: 1,
        selector: {matchLabels: {app: 'redis'}},
        template: {
          metadata: {labels: {app: 'redis'}},
          spec: {
            containers: [
              {
                name: 'redis',
                image: 'redis:7-alpine',
                command: redisCommand,
                ports: [{containerPort: 6379}],
                volumeMounts: [{name: 'redis-data', mountPath: '/data'}],
                resources: {
                  requests: {cpu: '50m', memory: '64Mi'},
                  limits: {cpu: '250m', memory: '256Mi'},
                },
                readinessProbe: {
                  exec: {command: ['redis-cli', 'ping']},
                  initialDelaySeconds: 5,
                  periodSeconds: 10,
                },
                livenessProbe: {
                  exec: {command: ['redis-cli', 'ping']},
                  initialDelaySeconds: 15,
                  periodSeconds: 20,
                },
              },
            ],
          },
        },
        volumeClaimTemplates: [
          {
            metadata: {name: 'redis-data'},
            spec: {
              accessModes: ['ReadWriteOnce'],
              ...(storageClass ? {storageClassName: storageClass} : {}),
              resources: {requests: {storage: '1Gi'}},
            },
          },
        ],
      },
    },
    {provider, dependsOn: [secret]}
  );

  const service = new k8s.core.v1.Service(
    'redis-svc',
    {
      metadata: {name: 'redis-svc', namespace},
      spec: {
        selector: {app: 'redis'},
        ports: [{port: 6379, targetPort: 6379}],
        clusterIP: 'None',
      },
    },
    {provider}
  );

  return {secret, service};
}
