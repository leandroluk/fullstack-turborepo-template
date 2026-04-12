// src/gcp/cluster.ts
import {
  gcpProject,
  gcpRegion,
  gcpZone,
  gkeInitialNodeCount,
  gkeMachineType,
  gkeMaxNodeCount,
  gkeMinNodeCount,
} from '#/shared/config.js';
import type {ClusterResult} from '#/shared/types.js';
import * as gcp from '@pulumi/gcp';
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

export function createCluster(): ClusterResult {
  // ── VPC network ───────────────────────────────────────────────────────────
  const network = new gcp.compute.Network('gke-network', {
    project: gcpProject,
    autoCreateSubnetworks: false,
  });

  const subnet = new gcp.compute.Subnetwork('gke-subnet', {
    project: gcpProject,
    region: gcpRegion,
    network: network.id,
    ipCidrRange: '10.0.0.0/16',
    secondaryIpRanges: [
      // Required for GKE pod and service CIDRs
      {rangeName: 'pods', ipCidrRange: '10.1.0.0/16'},
      {rangeName: 'services', ipCidrRange: '10.2.0.0/20'},
    ],
  });

  // ── GKE cluster ───────────────────────────────────────────────────────────
  const cluster = new gcp.container.Cluster('gke-cluster', {
    project: gcpProject,
    location: gcpZone,
    network: network.name,
    subnetwork: subnet.name,
    // Remove the default node pool — we create a managed one below
    removeDefaultNodePool: true,
    initialNodeCount: 1,
    ipAllocationPolicy: {
      clusterSecondaryRangeName: 'pods',
      servicesSecondaryRangeName: 'services',
    },
    workloadIdentityConfig: {
      workloadPool: pulumi.interpolate`${gcpProject}.svc.id.goog`,
    },
  });

  // ── Node pool with autoscaling ─────────────────────────────────────────
  new gcp.container.NodePool('gke-node-pool', {
    project: gcpProject,
    location: gcpZone,
    cluster: cluster.name,
    initialNodeCount: gkeInitialNodeCount,
    autoscaling: {
      minNodeCount: gkeMinNodeCount,
      maxNodeCount: gkeMaxNodeCount,
    },
    nodeConfig: {
      machineType: gkeMachineType,
      oauthScopes: ['https://www.googleapis.com/auth/cloud-platform'],
      workloadMetadataConfig: {mode: 'GKE_METADATA'},
    },
    management: {
      autoRepair: true,
      autoUpgrade: true,
    },
  });

  // ── Kubernetes provider ───────────────────────────────────────────────────
  const kubeconfig = pulumi
    .all([cluster.name, cluster.endpoint, cluster.masterAuth])
    .apply(([name, endpoint, auth]) => {
      const context = `${gcpProject}_${gcpRegion}_${name}`;
      return JSON.stringify({
        apiVersion: 'v1',
        kind: 'Config',
        clusters: [
          {
            name: context,
            cluster: {
              server: `https://${endpoint}`,
              'certificate-authority-data': auth.clusterCaCertificate,
            },
          },
        ],
        contexts: [{name: context, context: {cluster: context, user: context}}],
        'current-context': context,
        users: [
          {
            name: context,
            user: {
              'client-certificate-data': auth.clientCertificate,
              'client-key-data': auth.clientKey,
            },
          },
        ],
      });
    });

  const k8sProvider = new k8s.Provider('gcp-provider', {
    kubeconfig,
    suppressDeprecationWarnings: true,
  });

  return {
    k8sProvider,
    kubeconfig,
    gkeClusterName: cluster.name,
  };
}
