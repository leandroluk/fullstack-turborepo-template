// scripts/docker-push.js
// Builds and pushes all application images to the local k3d registry.
// Run from the repository root.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const REGISTRY = process.env.REGISTRY ?? 'localhost:5000'
const TAG = process.env.TAG ?? 'latest'

const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..')

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: true })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const apps = [
  { name: 'api', template: 'nestjs-11' },
  { name: 'web', template: 'nextjs-16' },
  { name: 'doc', template: 'nextra-4' },
]

for (const { name, template } of apps) {
  const dockerfile = resolve(REPO_ROOT, 'templates', template, 'Dockerfile')
  const image = `${REGISTRY}/${name}:${TAG}`

  if (!existsSync(dockerfile)) {
    console.log(`⚠  Skipping '${name}': Dockerfile not found at ${dockerfile}`)
    continue
  }

  console.log(`▶ Building ${image}...`)
  run('docker', ['build', '-f', dockerfile, '-t', image, REPO_ROOT])

  console.log(`▶ Pushing ${image}...`)
  run('docker', ['push', image])

  console.log(`✅ ${name} done\n`)
}

console.log(`All images pushed to ${REGISTRY}`)
