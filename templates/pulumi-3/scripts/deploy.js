// scripts/deploy.js
// Deploys the Pulumi stack. Target stack is read from STACK env var.
// In CI: STACK=aws REGISTRY=... TAG=... pnpm pipeline

import { spawnSync } from 'node:child_process'

const STACK = process.env.STACK ?? 'local'

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: true })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

console.log(`▶ Deploying stack '${STACK}'...`)
run('pulumi', ['up', '--yes', '--stack', STACK])
console.log(`✅ Stack '${STACK}' deployed.`)
