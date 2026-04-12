// src/aws/cluster.ts
import {
  desiredClusterSize,
  eksNodeInstanceType,
  maxClusterSize,
  minClusterSize,
  vpcNetworkCidr,
} from '#/shared/config.js';
import type {ClusterResult} from '#/shared/types.js';
import type * as awsTypes from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import * as eks from '@pulumi/eks';
import * as k8s from '@pulumi/kubernetes';

export function createCluster(): ClusterResult {
  const eksVpc = new awsx.ec2.Vpc('eks-vpc', {
    enableDnsHostnames: true,
    cidrBlock: vpcNetworkCidr,
  });

  const eksCluster = new eks.Cluster('eks-cluster', {
    vpcId: eksVpc.vpcId,
    authenticationMode: eks.AuthenticationMode.Api,
    publicSubnetIds: eksVpc.publicSubnetIds,
    privateSubnetIds: eksVpc.privateSubnetIds,
    instanceType: eksNodeInstanceType as awsTypes.ec2.InstanceType,
    desiredCapacity: desiredClusterSize,
    minSize: minClusterSize,
    maxSize: maxClusterSize,
    nodeAssociatePublicIpAddress: false,
    endpointPrivateAccess: false,
    endpointPublicAccess: true,
  });

  const k8sProvider = new k8s.Provider('aws-provider', {
    kubeconfig: eksCluster.kubeconfig.apply(JSON.stringify),
    suppressDeprecationWarnings: true,
  });

  return {
    k8sProvider,
    kubeconfig: eksCluster.kubeconfig,
    vpcId: eksVpc.vpcId,
  };
}
