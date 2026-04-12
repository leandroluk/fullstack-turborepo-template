import {hcloudLocation, hcloudServerType, vpcNetworkCidr} from '#/shared/config.js';
import type {ClusterResult} from '#/shared/types.js';
import * as hcloud from '@pulumi/hcloud';
import * as k8s from '@pulumi/kubernetes';

export function createCluster(): ClusterResult {
  const network = new hcloud.Network('k8s-net', {
    ipRange: vpcNetworkCidr,
  });

  const subnet = new hcloud.NetworkSubnet('k8s-subnet', {
    networkId: network.id.apply(id => Number(id)),
    type: 'cloud',
    networkZone: 'eu-central',
    ipRange: '10.0.1.0/24',
  });

  const firewall = new hcloud.Firewall('k8s-fw', {
    rules: [
      {direction: 'in', protocol: 'tcp', port: '22', sourceIps: ['0.0.0.0/0']},
      {direction: 'in', protocol: 'tcp', port: '6443', sourceIps: ['0.0.0.0/0']},
      {direction: 'in', protocol: 'tcp', port: '80', sourceIps: ['0.0.0.0/0']},
      {direction: 'in', protocol: 'tcp', port: '443', sourceIps: ['0.0.0.0/0']},
    ],
  });

  const master = new hcloud.Server(
    'k8s-master',
    {
      serverType: hcloudServerType,
      image: 'ubuntu-24.04',
      location: hcloudLocation,
      networks: [{networkId: network.id.apply(id => Number(id))}],
      firewallIds: [firewall.id.apply(id => Number(id))],
      userData: `#!/bin/bash
      curl -sfL https://get.k3s.io | sh -s - --disable servicelb --disable traefik`,
    },
    {dependsOn: [subnet]}
  );

  const kubeconfig = master.ipv4Address.apply(ip => {
    return `apiVersion: v1
kind: Config
clusters:
- cluster:
    server: https://${ip}:6443
    insecure-skip-tls-verify: true
  name: hcloud
contexts:
- context:
    cluster: hcloud
    user: hcloud
  name: hcloud
current-context: hcloud
users:
- name: hcloud
  user:
    token: ""`;
  });

  const k8sProvider = new k8s.Provider('hcloud-provider', {
    kubeconfig,
  });

  return {
    k8sProvider,
    kubeconfig,
  };
}
