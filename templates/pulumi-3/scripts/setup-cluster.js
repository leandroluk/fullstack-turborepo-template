// scripts/setup-cluster.js
// Creates a k3d cluster with Traefik disabled, a local registry, and
// host ports 80/443 mapped for ingress access.

import { spawnSync } from 'node:child_process'

const CLUSTER_NAME = process.env.CLUSTER_NAME ?? 'fullstack'
const REGISTRY_NAME = process.env.REGISTRY_NAME ?? 'k3d-registry.localhost'
const REGISTRY_PORT = process.env.REGISTRY_PORT ?? '5000'

function run(cmd, args, { ignoreError = false } = {}) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: true })
  if (!ignoreError && result.status !== 0) process.exit(result.status ?? 1)
  return result
}

console.log(`▶ Creating k3d registry '${REGISTRY_NAME}:${REGISTRY_PORT}'...`)
const registryResult = run('k3d', ['registry', 'create', REGISTRY_NAME, '--port', REGISTRY_PORT], { ignoreError: true })
if (registryResult.status !== 0) {
  console.log('  Registry already exists, skipping.')
}

console.log(`▶ Creating k3d cluster '${CLUSTER_NAME}'...`)
run('k3d', [
  'cluster', 'create', CLUSTER_NAME,
  '--registry-use', `${REGISTRY_NAME}:${REGISTRY_PORT}`,
  '--k3s-arg', '--disable=traefik@server:*',
  '--port', '80:80@loadbalancer',
  '--port', '443:443@loadbalancer',
  '--wait',
])

console.log(`
✅ Cluster ready!

Next steps:
  node scripts/docker-push.js
  pulumi config set --secret k8s:postgresPassword yourpassword --stack local
  pulumi config set --secret k8s:redisPassword    yourpassword --stack local
  pulumi config set --secret k8s:minioRootPassword yourpassword --stack local
  pulumi up --stack local`)
