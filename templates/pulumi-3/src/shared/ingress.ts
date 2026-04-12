// src/shared/ingress.ts
import * as k8s from '@pulumi/kubernetes';
import type * as pulumi from '@pulumi/pulumi';
import type {ProviderName} from './types.js';

/**
 * Installs NGINX Ingress Controller via Helm.
 *
 * Service type / annotations per provider:
 *   local     → NodePort  (k3d maps host port 80 → ingress)
 *   baremetal → NodePort  (MetalLB assigns the external IP separately)
 *   aws       → LoadBalancer + NLB annotation
 *   gcp       → LoadBalancer (GCP provisions an L4 NLB automatically)
 */
export function createIngressController(
  k8sProvider: k8s.Provider,
  providerName: ProviderName,
  dependsOn: pulumi.Resource[] = []
): k8s.helm.v3.Release {
  return new k8s.helm.v3.Release(
    'ingress-nginx',
    {
      chart: 'ingress-nginx',
      version: '4.10.1',
      repositoryOpts: {repo: 'https://kubernetes.github.io/ingress-nginx'},
      namespace: 'ingress-nginx',
      createNamespace: true,
      values: {
        controller: {
          service: buildServiceValues(providerName),
          allowSnippetAnnotations: true,
        },
      },
    },
    {provider: k8sProvider, dependsOn}
  );
}

function buildServiceValues(providerName: ProviderName): {type: string; annotations?: Record<string, string>} {
  switch (providerName) {
    case 'aws':
      return {
        type: 'LoadBalancer',
        annotations: {'service.beta.kubernetes.io/aws-load-balancer-type': 'nlb'},
      };
    case 'gcp':
      return {
        type: 'LoadBalancer',
        annotations: {'networking.gke.io/load-balancer-type': 'External'},
      };
    case 'hcloud':
      return {
        type: 'LoadBalancer',
        annotations: {
          'load-balancer.hetzner.cloud/location': 'nbg1',
          'load-balancer.hetzner.cloud/use-private-ip': 'true',
        },
      };
    case 'local':
    case 'baremetal':
    default:
      return {type: 'NodePort'};
  }
}

/**
 * Creates Ingress routing rules:
 *   web.<baseDomain> → web-svc:3000
 *   doc.<baseDomain> → doc-svc:3001
 *   api.<baseDomain> → api-svc:3333
 */
export function createIngress(
  k8sProvider: k8s.Provider,
  namespace: pulumi.Input<string>,
  baseDomain: string,
  ingressController: k8s.helm.v3.Release
): k8s.networking.v1.Ingress {
  const routes = [
    {host: `web.${baseDomain}`, service: 'web-svc', port: 3000},
    {host: `doc.${baseDomain}`, service: 'doc-svc', port: 3001},
    {host: `api.${baseDomain}`, service: 'api-svc', port: 3333},
  ];

  return new k8s.networking.v1.Ingress(
    'app-ingress',
    {
      metadata: {
        name: 'app-ingress',
        namespace,
        annotations: {
          'kubernetes.io/ingress.class': 'nginx',
          'nginx.ingress.kubernetes.io/proxy-body-size': '50m',
        },
      },
      spec: {
        rules: routes.map(({host, service, port}) => ({
          host,
          http: {
            paths: [
              {
                path: '/',
                pathType: 'Prefix',
                backend: {service: {name: service, port: {number: port}}},
              },
            ],
          },
        })),
      },
    },
    {provider: k8sProvider, dependsOn: [ingressController]}
  );
}
