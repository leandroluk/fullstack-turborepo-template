# k8s — Pulumi Kubernetes Template

This template deploys the full **fullstack-turborepo-template** stack (NestJS API, Next.js web app, Nextra docs) to Kubernetes using TypeScript + Pulumi.

It supports five deployment targets out of the box:

| Provider    | Where it runs              | Object Storage | Config file             |
| ----------- | -------------------------- | -------------- | ----------------------- |
| `local`     | k3d on your machine        | MinIO          | `Pulumi.local.yaml`     |
| `baremetal` | Any existing cluster       | MinIO          | `Pulumi.baremetal.yaml` |
| `hcloud`    | Hetzner Cloud (K3s)        | MinIO          | `Pulumi.hcloud.yaml`    |
| `aws`       | AWS EKS (auto-provisioned) | S3             | `Pulumi.aws.yaml`       |
| `gcp`       | GCP GKE (auto-provisioned) | GCS via HMAC   | `Pulumi.gcp.yaml`       |

---

## What gets deployed

Every provider deploys the same application stack:

| Resource                       | Type                 | Details                       |
| ------------------------------ | -------------------- | ----------------------------- |
| `app` namespace                | Namespace            | Isolates all workloads        |
| NGINX Ingress Controller       | Helm Release         | Routes traffic by subdomain   |
| PostgreSQL 16                  | StatefulSet + PVC    | 5 Gi persistent storage       |
| Redis 7                        | StatefulSet + PVC    | 1 Gi, AOF persistence enabled |
| `api` — NestJS 11              | Deployment + Service | Port 3333                     |
| `web` — Next.js 16             | Deployment + Service | Port 3000                     |
| `doc` — Nextra 4               | Deployment + Service | Port 3001                     |
| Ingress rules                  | Ingress              | Subdomain routing             |
| **MinIO** *(local/bm/hcloud)*  | StatefulSet + PVC    | 10 Gi, S3-compatible          |
| **MetalLB** *(baremetal only)* | Helm Release + CRDs  | L2 LoadBalancer               |

After a successful deploy, your apps will be available at:

| URL                         | App                                               |
| --------------------------- | ------------------------------------------------- |
| `http://api.<baseDomain>`   | NestJS API                                        |
| `http://web.<baseDomain>`   | Next.js frontend                                  |
| `http://doc.<baseDomain>`   | Nextra docs                                       |
| `http://minio.<baseDomain>` | MinIO console *(local / baremetal / hcloud only)* |

---

## Before you start — required tools

Install these tools before running anything:

- [Node.js 18+](https://nodejs.org/) and [pnpm](https://pnpm.io/)
- [Pulumi CLI](https://www.pulumi.com/docs/install/) — `brew install pulumi` or see link
- [Docker](https://www.docker.com/) — needed to build images

Additional tools depending on your target:

| Target      | Extra tools needed                                                             |
| ----------- | ------------------------------------------------------------------------------ |
| `local`     | [k3d](https://k3d.io/stable/#installation)                                     |
| `baremetal` | [kubectl](https://kubernetes.io/docs/tasks/tools/) configured for your cluster |
| `hcloud`    | A [Hetzner Cloud](https://console.hetzner.cloud/) account + API token          |
| `aws`       | [AWS CLI](https://aws.amazon.com/cli/) configured (`aws configure`)            |
| `gcp`       | [gcloud CLI](https://cloud.google.com/sdk/docs/install) configured             |

---

## Pulumi state backend

Pulumi tracks what it has deployed in a **state file** (like Terraform's `.tfstate`). You need to configure where this state is stored before your first deploy.

**Option A — Pulumi Cloud (easiest, free tier available):**
```bash
pulumi login
```

**Option B — Store state in your cloud bucket:**
```bash
pulumi login s3://your-bucket-name           # AWS S3
pulumi login gs://your-bucket-name           # GCP Cloud Storage
pulumi login azblob://your-container-name    # Azure Blob Storage
```

**Option C — Local file (good for solo projects):**
```bash
pulumi login file://./state
# commit the ./state folder to your repo
```

**Option D — Self-hosted MinIO (local/baremetal):**
```bash
pulumi login s3://your-bucket \
  --endpoint-url http://your-minio-host:9000
```

> You only need to run `pulumi login` once per machine. Pulumi remembers the backend.

---

## Environment variables

All scripts read configuration from a `.env` file in this directory.
Copy the example and edit it before running anything:

```bash
cp .env.example .env
```

| Variable        | Default                  | Description                                                                 |
| --------------- | ------------------------ | --------------------------------------------------------------------------- |
| `STACK`         | `local`                  | Which Pulumi stack to target (`local`, `aws`, `gcp`, `hcloud`, `baremetal`) |
| `REGISTRY`      | `localhost:5000`         | Container registry URL                                                      |
| `TAG`           | `latest`                 | Image tag — use `$GIT_SHA` in CI for precise tracking                       |
| `FORCE_DEPLOY`  | `false`                  | Set to `true` to rebuild all images, ignoring change detection              |
| `CLUSTER_NAME`  | `fullstack`              | k3d cluster name *(local only)*                                             |
| `REGISTRY_NAME` | `k3d-registry.localhost` | k3d registry name *(local only)*                                            |
| `REGISTRY_PORT` | `5000`                   | k3d registry port *(local only)*                                            |

---

## Available scripts

Run these from inside `templates/pulumi-3/`:

| Script                  | What it does                                                           |
| ----------------------- | ---------------------------------------------------------------------- |
| `pnpm cluster:setup`    | Creates local k3d registry + cluster *(local only)*                    |
| `pnpm cluster:teardown` | Destroys the Pulumi stack and k3d cluster                              |
| `pnpm docker:push`      | Builds all 3 images and pushes them to `REGISTRY`                      |
| `pnpm deploy`           | Runs `pulumi up` for the stack in `STACK`                              |
| `pnpm pipeline`         | `docker:push` + `deploy` — full rebuild and deploy                     |
| `pnpm ci`               | Smart CI: detects what changed, pushes only those images, then deploys |
| `pnpm local`            | `cluster:setup` + `docker:push` + `deploy` — one command for local     |
| `pnpm preview:local`    | Shows what Pulumi would change without applying anything               |
| `pnpm up:local`         | Runs `pulumi up` for the local stack directly                          |
| `pnpm destroy:local`    | Destroys all resources in the local stack                              |

---

## Local development (k3d)

This flow runs everything on your machine inside Docker using k3d.

### Step 1 — Set up your `.env`

```bash
cp .env.example .env
# the defaults already work for local, nothing to change
```

### Step 2 — Create the cluster *(first time only)*

```bash
pnpm cluster:setup
```

This creates a local k3d cluster named `fullstack` and a local container registry at `localhost:5000`.

### Step 3 — Set secret values *(first time only)*

```bash
pulumi config set --secret k8s:postgresPassword  yourpassword --stack local
pulumi config set --secret k8s:redisPassword     yourpassword --stack local
pulumi config set --secret k8s:minioRootPassword yourpassword --stack local
```

> These are saved encrypted in `Pulumi.local.yaml`. You only need to do this once.

### Step 4 — Deploy

```bash
pnpm local
```

This builds and pushes the three app images, then runs `pulumi up`. Done.

**On subsequent runs** (after code changes):
```bash
pnpm local   # rebuilds images + redeploys
```

**Access your apps at:**
- `http://api.127.0.0.1.nip.io`
- `http://web.127.0.0.1.nip.io`
- `http://doc.127.0.0.1.nip.io`
- `http://minio.127.0.0.1.nip.io`

### Teardown

```bash
pnpm cluster:teardown
```

---

## Baremetal (existing cluster)

Use this if you already have a Kubernetes cluster running (e.g. K3s on a VPS, RKE2, etc.).

### Step 1 — Make sure kubectl is configured

```bash
kubectl get nodes   # should list your cluster nodes
```

### Step 2 — Edit `Pulumi.baremetal.yaml`

Open the file and set:
- `k8s:baseDomain` — the domain or IP for your cluster. If you don't have a domain, use `<your-node-ip>.nip.io` (e.g. `192.168.1.100.nip.io`)
- `k8s:metallbAddressPool` — a free IP range in your network for MetalLB (e.g. `192.168.1.200-192.168.1.210`)
- `k8s:storageClass` — the storage class available in your cluster (`local-path`, `longhorn`, `nfs-client`, etc.)
- `k8s:apiImage`, `k8s:webImage`, `k8s:docImage` — your image URLs in a registry accessible from the cluster

### Step 3 — Set secrets

```bash
pulumi config set --secret k8s:postgresPassword  yourpassword --stack baremetal
pulumi config set --secret k8s:redisPassword     yourpassword --stack baremetal
pulumi config set --secret k8s:minioRootPassword yourpassword --stack baremetal
```

### Step 4 — Push images and deploy

```bash
STACK=baremetal REGISTRY=your.registry.com pnpm pipeline
```

### Teardown

```bash
STACK=baremetal pnpm cluster:teardown
```

---

## Hetzner Cloud (hcloud)

Pulumi will provision a server on Hetzner, install K3s on it, then deploy the full stack.

### Step 1 — Get your Hetzner API token

Go to [Hetzner Cloud Console](https://console.hetzner.cloud/) → your project → **Security** → **API Tokens** → create a token with **Read & Write** permissions.

### Step 2 — Edit `Pulumi.hcloud.yaml`

- `k8s:baseDomain` — your domain or a nip.io address
- `k8s:hcloudServerType` — machine size (e.g. `cx22`, `cx32`)
- `k8s:hcloudLocation` — datacenter region (`nbg1`, `fsn1`, `hel1`)

### Step 3 — Set secrets

```bash
pulumi config set --secret hcloud:token          your_token   --stack hcloud
pulumi config set --secret k8s:postgresPassword  yourpassword --stack hcloud
pulumi config set --secret k8s:redisPassword     yourpassword --stack hcloud
pulumi config set --secret k8s:minioRootPassword yourpassword --stack hcloud
```

### Step 4 — Deploy

```bash
STACK=hcloud REGISTRY=your.registry.com pnpm pipeline
```

Pulumi will provision the server, install K3s, and deploy everything. This takes a few minutes.

### Teardown

```bash
STACK=hcloud pnpm cluster:teardown
# this destroys the Hetzner server and all resources
```

---

## AWS (EKS)

Pulumi will create a VPC, an EKS cluster, and deploy the full stack into it.

### Step 1 — Configure AWS credentials

```bash
aws configure   # enter your access key, secret key, and region
```

### Step 2 — Edit `Pulumi.aws.yaml`

- `k8s:awsRegion` — AWS region (e.g. `us-east-1`)
- `k8s:awsS3Bucket` — an existing S3 bucket name for object storage
- `k8s:apiImage`, `k8s:webImage`, `k8s:docImage` — ECR image URLs
- `k8s:eksNodeInstanceType` — EC2 instance type (default: `t3.medium`)
- `k8s:desiredClusterSize` / `minClusterSize` / `maxClusterSize` — node autoscaling

### Step 3 — Set secrets

```bash
pulumi config set --secret k8s:postgresPassword yourpassword --stack aws
pulumi config set --secret k8s:redisPassword    yourpassword --stack aws
```

### Step 4 — Push images to ECR and deploy

```bash
# authenticate Docker with ECR first
aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin \
    <account>.dkr.ecr.us-east-1.amazonaws.com

STACK=aws \
REGISTRY=<account>.dkr.ecr.us-east-1.amazonaws.com \
TAG=latest \
pnpm pipeline
```

### Teardown

```bash
STACK=aws pnpm cluster:teardown
```

> **Warning:** this will delete the EKS cluster, VPC, and all resources. Data in PVCs will be lost.

---

## GCP (GKE)

Pulumi will create a VPC, a GKE cluster, and deploy the full stack into it.

### Step 1 — Configure gcloud

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project your-project-id
```

### Step 2 — Enable HMAC keys for GCS (S3 interop)

Go to [GCS Settings → Interoperability](https://console.cloud.google.com/storage/settings;tab=interoperability) and create an HMAC access key.

### Step 3 — Edit `Pulumi.gcp.yaml`

- `k8s:gcpProject` — your GCP project ID
- `k8s:gcpRegion` / `k8s:gcpZone` — where to deploy
- `k8s:gcpGcsBucket` — an existing GCS bucket name
- `k8s:apiImage`, `k8s:webImage`, `k8s:docImage` — Artifact Registry image URLs
- `k8s:gkeMachineType` — node machine type (default: `e2-standard-2`)

### Step 4 — Set secrets

```bash
pulumi config set --secret k8s:postgresPassword yourpassword --stack gcp
pulumi config set --secret k8s:redisPassword    yourpassword --stack gcp
pulumi config set --secret k8s:gcpHmacAccessKey yourkey      --stack gcp
pulumi config set --secret k8s:gcpHmacSecretKey yoursecret   --stack gcp
```

### Step 5 — Push images and deploy

```bash
# authenticate Docker with Artifact Registry first
gcloud auth configure-docker us-central1-docker.pkg.dev

STACK=gcp \
REGISTRY=us-central1-docker.pkg.dev/your-project/your-repo \
TAG=latest \
pnpm pipeline
```

### Teardown

```bash
STACK=gcp pnpm cluster:teardown
```

---

## CI/CD pipeline

### How it works

The `pnpm ci` script automates selective deploys:

1. Runs `turbo build --dry=json --filter=[HEAD^1]` to find which packages changed since the last commit
2. Rebuilds and pushes **only** the Docker images for changed apps
3. Updates the Pulumi image config for those apps (`pulumi config set k8s:apiImage ...`)
4. Runs `pulumi up` — Pulumi diffs the current state and only restarts the affected Deployments

Using a git SHA as the image tag is critical here — it lets Pulumi detect that a Deployment's image actually changed.

### Example — GitHub Actions

```yaml
name: deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2    # required — turbo needs HEAD^1 to detect changes

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install

      - name: configure pulumi backend
        run: pulumi login s3://your-state-bucket
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: ci
        working-directory: templates/pulumi-3
        env:
          STACK: aws
          REGISTRY: ${{ secrets.ECR_REGISTRY }}
          TAG: ${{ github.sha }}
          PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN }}
        run: pnpm ci
```

### Force a full rebuild

Set `FORCE_DEPLOY=true` to skip change detection and rebuild all images:

```bash
FORCE_DEPLOY=true STACK=aws TAG=$(git rev-parse HEAD) pnpm ci
```

---

## Storage variables injected into every pod

All providers inject the same S3-compatible environment variables into every app container. Your application code never needs to know which cloud provider is being used.

```
S3_ENDPOINT   → MinIO URL (local/baremetal/hcloud) or cloud endpoint (aws/gcp)
S3_BUCKET     → Bucket name
S3_ACCESS_KEY → Access key
S3_SECRET_KEY → Secret key
S3_REGION     → Region (MinIO accepts any value, but SDKs require it)
S3_USE_SSL    → "true" for aws/gcp, "false" for local/baremetal/hcloud
```

---

## Health check convention

All app containers must expose a `GET /health` endpoint on their configured port. The Kubernetes readiness and liveness probes call this endpoint to determine if the pod is ready to serve traffic.

| App   | Port | Endpoint      |
| ----- | ---- | ------------- |
| `api` | 3333 | `GET /health` |
| `web` | 3000 | `GET /health` |
| `doc` | 3001 | `GET /health` |

If your app doesn't implement `/health`, the pod will never become Ready and the deployment will appear stuck.

---

## Project structure

```
templates/pulumi-3/
├── scripts/
│   ├── setup-cluster.js    Creates k3d cluster + registry (local only)
│   ├── teardown-cluster.js Destroys stack and cluster
│   ├── docker-push.js      Builds and pushes all 3 images
│   ├── deploy.js           Runs pulumi up for the target stack
│   └── ci.js               Smart CI: change detection + selective push + deploy
│
├── src/
│   ├── index.ts            Entry point — selects provider and orchestrates deploy
│   ├── shared/
│   │   ├── config.ts       All config values read from Pulumi stack config
│   │   ├── types.ts        Shared TypeScript interfaces
│   │   ├── namespace.ts    Creates the "app" Kubernetes namespace
│   │   ├── ingress.ts      NGINX Ingress Controller + routing rules
│   │   ├── postgres.ts     PostgreSQL StatefulSet + PVC + Secret
│   │   ├── redis.ts        Redis StatefulSet + PVC + Secret
│   │   ├── minio.ts        MinIO StatefulSet + bucket creation Job
│   │   ├── storage-secret.ts  S3-compatible Secret for AWS and GCP
│   │   └── apps.ts         Deployments + Services for api, web, doc
│   ├── aws/
│   │   └── cluster.ts      Provisions EKS cluster + VPC
│   ├── gcp/
│   │   └── cluster.ts      Provisions GKE cluster + VPC
│   ├── hcloud/
│   │   └── cluster.ts      Provisions Hetzner server + installs K3s
│   └── baremetal/
│       └── metallb.ts      MetalLB Helm chart + IPAddressPool + L2Advertisement
│
├── Pulumi.yaml             Project definition
├── Pulumi.local.yaml       Stack config for local k3d
├── Pulumi.baremetal.yaml   Stack config for baremetal
├── Pulumi.hcloud.yaml      Stack config for Hetzner Cloud
├── Pulumi.aws.yaml         Stack config for AWS EKS
├── Pulumi.gcp.yaml         Stack config for GCP GKE
├── .env                    Local env vars (gitignored)
└── .env.example            Template for .env
```

---

## Troubleshooting

**`pulumi up` says "no Pulumi.yaml found"**
Make sure you are running commands from inside `templates/pulumi-3/`, not from the repo root.

**Pod is stuck in `Pending`**
The cluster may not have enough resources, or the storage class doesn't exist. Run `kubectl describe pod <name> -n app` to see the reason.

**Pod is stuck in `CrashLoopBackOff`**
The app crashed on startup. Run `kubectl logs <pod-name> -n app` to see the error. Most likely cause: missing env vars or the `/health` endpoint is not implemented.

**Image pull error (`ErrImagePull`)**
The cluster can't reach the registry. For local, make sure the k3d cluster was created with `pnpm cluster:setup` so it has access to `localhost:5000`. For cloud providers, make sure the image URL in the Pulumi stack config is correct and the cluster has pull permissions.

**`turbo` not found during `pnpm ci`**
Run `pnpm install` from the repo root first. Turbo is a dev dependency of the workspace root.

**Changes not detected by `pnpm ci`**
Make sure your git checkout has at least 2 commits (`fetch-depth: 2` in GitHub Actions). With a shallow clone of depth 1, `HEAD^1` doesn't exist and `turbo --filter=[HEAD^1]` can't compare. The script will fall back to deploying all apps in that case.
