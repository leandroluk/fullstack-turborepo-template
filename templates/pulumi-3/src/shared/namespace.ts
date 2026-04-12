// src/shared/namespace.ts
import * as k8s from '@pulumi/kubernetes';

export function createNamespace(provider: k8s.Provider): k8s.core.v1.Namespace {
  return new k8s.core.v1.Namespace('app-ns', {metadata: {name: 'app'}}, {provider});
}
