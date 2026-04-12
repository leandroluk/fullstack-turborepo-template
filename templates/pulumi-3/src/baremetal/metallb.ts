// src/baremetal/metallb.ts
import * as k8s from '@pulumi/kubernetes';

/**
 * Installs MetalLB via Helm and configures an L2 address pool.
 *
 * MetalLB gives LoadBalancer-type Services a real IP on bare-metal networks
 * where there is no cloud provider to provision one automatically.
 *
 * addressPool format: "192.168.1.200-192.168.1.210"
 * This range must be unused IPs on the same L2 segment as the nodes.
 */
export function createMetalLB(
  provider: k8s.Provider,
  addressPool: string
): {
  release: k8s.helm.v3.Release;
  pool: k8s.apiextensions.CustomResource;
  advertisement: k8s.apiextensions.CustomResource;
} {
  const release = new k8s.helm.v3.Release(
    'metallb',
    {
      chart: 'metallb',
      version: '0.14.5',
      repositoryOpts: {repo: 'https://metallb.github.io/metallb'},
      namespace: 'metallb-system',
      createNamespace: true,
      // Wait for CRDs before creating pool resources
      waitForJobs: true,
    },
    {provider}
  );

  // IPAddressPool — the range MetalLB will assign from
  const pool = new k8s.apiextensions.CustomResource(
    'metallb-pool',
    {
      apiVersion: 'metallb.io/v1beta1',
      kind: 'IPAddressPool',
      metadata: {name: 'default-pool', namespace: 'metallb-system'},
      spec: {
        addresses: [addressPool],
      },
    },
    {provider, dependsOn: [release]}
  );

  // L2Advertisement — announce the pool via ARP/NDP
  const advertisement = new k8s.apiextensions.CustomResource(
    'metallb-l2advert',
    {
      apiVersion: 'metallb.io/v1beta1',
      kind: 'L2Advertisement',
      metadata: {name: 'default-l2advert', namespace: 'metallb-system'},
      spec: {
        ipAddressPools: ['default-pool'],
      },
    },
    {provider, dependsOn: [pool]}
  );

  return {release, pool, advertisement};
}
