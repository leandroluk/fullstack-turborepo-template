// scripts/ci.js
// CI pipeline: detects changed apps via turbo, pushes only their images,
// updates Pulumi image config refs, then runs pulumi up.
//
// Env vars:
//   STACK          — pulumi stack to deploy (default: local)
//   REGISTRY       — container registry URL (default: localhost:5000)
//   TAG            — image tag, use git SHA in CI (default: latest)
//   FORCE_DEPLOY   — set to "true" to skip change detection and rebuild all apps

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PULUMI_DIR = resolve(__dirname, '..')
const REPO_ROOT = resolve(__dirname, '..', '..', '..')

const STACK = process.env.STACK ?? 'local'
const REGISTRY = process.env.REGISTRY ?? 'localhost:5000'
const TAG = process.env.TAG ?? 'latest'
const FORCE_DEPLOY = process.env.FORCE_DEPLOY === 'true'

const APPS = [
  { name: 'api', template: 'nestjs-11', configKey: 'k8s:apiImage' },
  { name: 'web', template: 'nextjs-16', configKey: 'k8s:webImage' },
  { name: 'doc', template: 'nextra-4',  configKey: 'k8s:docImage' },
]

function run(cmd, args, { ignoreError = false, ...opts } = {}) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts })
  if (!ignoreError && result.status !== 0) process.exit(result.status ?? 1)
  return result
}

// ── 1. Detect changed packages ───────────────────────────────────────────────

function getChangedPackages() {
  if (FORCE_DEPLOY) {
    console.log('ℹ  FORCE_DEPLOY=true — rebuilding all apps')
    return APPS.map(a => `@templates/${a.template}`)
  }

  console.log('▶ Detecting changed packages...')

  const result = spawnSync(
    'turbo',
    ['run', 'build', '--dry=json', '--filter=[HEAD^1]'],
    { shell: true, encoding: 'utf-8', cwd: REPO_ROOT },
  )

  if (result.status !== 0 || !result.stdout?.trim()) {
    console.warn('⚠  turbo dry-run failed — rebuilding all apps as fallback')
    return APPS.map(a => `@templates/${a.template}`)
  }

  try {
    const data = JSON.parse(result.stdout)
    const packages = [...new Set(data.tasks?.map(t => t.package) ?? [])]
    console.log(`   Affected: ${packages.length ? packages.join(', ') : '(none)'}`)
    return packages
  } catch {
    console.warn('⚠  Could not parse turbo output — rebuilding all apps as fallback')
    return APPS.map(a => `@templates/${a.template}`)
  }
}

const changedPackages = getChangedPackages()

// ── 2. Build, push and update Pulumi config for each changed app ─────────────

let anyChanged = false

for (const { name, template, configKey } of APPS) {
  const pkg = `@templates/${template}`

  if (!changedPackages.includes(pkg)) {
    console.log(`⏭  ${name}: unchanged, skipping`)
    continue
  }

  const dockerfile = resolve(REPO_ROOT, 'templates', template, 'Dockerfile')

  if (!existsSync(dockerfile)) {
    console.warn(`⚠  ${name}: Dockerfile not found at ${dockerfile}, skipping`)
    continue
  }

  const image = `${REGISTRY}/${name}:${TAG}`

  console.log(`\n▶ Building ${image}...`)
  run('docker', ['build', '-f', dockerfile, '-t', image, REPO_ROOT])

  console.log(`▶ Pushing ${image}...`)
  run('docker', ['push', image])

  console.log(`▶ Updating config: ${configKey} = ${image}`)
  run('pulumi', ['config', 'set', configKey, image, '--stack', STACK], { cwd: PULUMI_DIR })

  console.log(`✅ ${name} done`)
  anyChanged = true
}

if (!anyChanged) {
  console.log('\nℹ  No app images changed.')
}

// ── 3. Deploy ────────────────────────────────────────────────────────────────

console.log(`\n▶ pulumi up --stack ${STACK}`)
run('pulumi', ['up', '--yes', '--stack', STACK], { cwd: PULUMI_DIR })

console.log(`\n✅ Stack '${STACK}' deployed.`)
