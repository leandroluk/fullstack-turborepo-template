// scripts/teardown-cluster.js
// Destroys the Pulumi stack and (for local) deletes the k3d cluster + registry.

import { spawnSync } from 'node:child_process'

const CLUSTER_NAME = process.env.CLUSTER_NAME ?? 'fullstack'
const REGISTRY_NAME = process.env.REGISTRY_NAME ?? 'k3d-registry.localhost'
const STACK = process.env.STACK ?? 'local'

function run(cmd, args, { ignoreError = false } = {}) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: true })
  if (!ignoreError && result.status !== 0) process.exit(result.status ?? 1)
}

console.log(`▶ Destroying Pulumi stack '${STACK}'...`)
run('pulumi', ['destroy', '--stack', STACK, '--yes'], { ignoreError: true })

if (STACK === 'local') {
  console.log(`▶ Deleting k3d cluster '${CLUSTER_NAME}'...`)
  run('k3d', ['cluster', 'delete', CLUSTER_NAME], { ignoreError: true })

  console.log(`▶ Deleting k3d registry '${REGISTRY_NAME}'...`)
  run('k3d', ['registry', 'delete', REGISTRY_NAME], { ignoreError: true })
}

console.log('✅ Teardown complete.')
