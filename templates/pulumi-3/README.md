<!-- README.md -->
# k8s — Pulumi Kubernetes Template

Deploys the full **fullstack-turborepo-template** stack to Kubernetes using TypeScript + Pulumi.

Supports four providers via `k8s:provider`:

| Provider    | Cluster            | Object Storage     | Reference Stack         |
| ----------- | ------------------ | ------------------ | ----------------------- |
| `local`     | k3d (Docker)       | MinIO              | `Pulumi.local.yaml`     |
| `baremetal` | Existing cluster   | MinIO              | `Pulumi.baremetal.yaml` |
| `aws`       | EKS (provisioned)  | Native S3          | `Pulumi.aws.yaml`       |
| `gcp`       | GKE (provisioned)  | GCS via HMAC       | `Pulumi.gcp.yaml`       |

---

## Deployed Stack (all providers)

| Resource                      | Kind                 | Detail                       |
| ----------------------------- | -------------------- | ---------------------------- |
| `app` namespace               | Namespace            | Isolates all workloads       |
| NGINX Ingress Controller      | Helm Release         | Traefik disabled in k3d      |
| PostgreSQL 16                 | StatefulSet + PVC    | 5 Gi                         |
| Redis 7                       | StatefulSet + PVC    | 1 Gi, AOF enabled            |
| `api` (NestJS)                | Deployment + Service | port 3333                    |
| `web` (Next.js)               | Deployment + Service | port 3000                    |
| `doc` (Nextra)                | Deployment + Service | port 3001                    |
| Ingress rules                 | Ingress              | Subdomain routing            |
| **MinIO** *(local/baremetal)* | StatefulSet + PVC    | 10 Gi, port 9000/9001        |
| **MetalLB** *(baremetal)*     | Helm Release + CRDs  | L2 LoadBalancer              |

---

## URLs after deploy

| URL                         | App                               |
| --------------------------- | --------------------------------- |
| `http://web.<baseDomain>`   | Next.js 16                        |
| `http://doc.<baseDomain>`   | Nextra 4                          |
| `http://api.<baseDomain>`   | NestJS 11                         |
| `http://minio.<baseDomain>` | MinIO Console *(local/baremetal)* |

---

## Storage variables injected into pods

All providers inject the same set of S3-compatible variables.
The application code does not need to know which provider is in use.

```
S3_ENDPOINT   → MinIO (local/baremetal) | S3 endpoint (aws) | GCS interop (gcp)
S3_BUCKET     → Bucket name
S3_ACCESS_KEY → Access key
S3_SECRET_KEY → Secret key
S3_REGION     → Region (MinIO ignores it, but SDKs require it)
S3_USE_SSL    → "true" (aws/gcp) | "false" (local/baremetal)
```

---

## Prerequisites

| Provider    | Tools                                                |
| ----------- | ---------------------------------------------------- |
| `local`     | [k3d](https://k3d.io/) + Docker + Pulumi CLI + pnpm  |
| `baremetal` | kubectl pointing to the cluster + Pulumi CLI + pnpm  |
| `aws`       | Configured AWS CLI + Pulumi CLI + pnpm               |
| `gcp`       | Configured gcloud + Pulumi CLI + pnpm                |

---

## Local flow (k3d)

```bash
# 1. Create cluster + registry (only the first time)
pnpm cluster:setup

# 2. Build and push images
pnpm docker:push

# 3. Secrets (only the first time)
pulumi config set --secret k8s:postgresPassword  yourpassword --stack local
pulumi config set --secret k8s:redisPassword     yourpassword --stack local
pulumi config set --secret k8s:minioRootPassword yourpassword --stack local

# 4. Deploy
pnpm up:local

# Or all at once (assuming secrets are already configured):
pnpm local
```

---

## Baremetal flow

```bash
# Prerequisite: kubectl pointing to the cluster (kubeconfig configured)

# 1. Adjust Pulumi.baremetal.yaml:
#    - k8s:baseDomain         → Node's IP + .nip.io or custom domain
#    - k8s:metallbAddressPool → range of free IPs in your L2 network
#    - k8s:storageClass       → available class in the cluster (e.g.: longhorn)
#    - k8s:*Image             → images in your registry

# 2. Secrets
pulumi config set --secret k8s:postgresPassword  yourpassword --stack baremetal
pulumi config set --secret k8s:redisPassword     yourpassword --stack baremetal
pulumi config set --secret k8s:minioRootPassword yourpassword --stack baremetal

# 3. Deploy
pnpm up --stack baremetal
```

---

## AWS flow (EKS)

```bash
# Prerequisite: Configured AWS CLI with EKS/VPC creation permissions

# 1. Adjust Pulumi.aws.yaml (region, S3 bucket, ECR images, etc.)

# 2. Secrets
pulumi config set --secret k8s:postgresPassword yourpassword --stack aws

# 3. Deploy (provisions VPC + EKS + everything)
pnpm up --stack aws
```

---

## GCP flow (GKE)

```bash
# Prerequisite: gcloud auth login && gcloud auth application-default login

# 1. Adjust Pulumi.gcp.yaml (project, region, GCS bucket, images, etc.)

# 2. Create HMAC keys in GCS (S3 interoperability):
#    https://console.cloud.google.com/storage/settings;tab=interoperability

# 3. Secrets
pulumi config set --secret k8s:postgresPassword  yourpassword --stack gcp
pulumi config set --secret k8s:gcpHmacAccessKey  yourkey      --stack gcp
pulumi config set --secret k8s:gcpHmacSecretKey  yoursecret   --stack gcp

# 4. Deploy (provisions VPC + GKE + everything)
pnpm up --stack gcp
```

---

## Teardown

```bash
# Local (destroys stack + k3d cluster)
pnpm cluster:teardown

# Other stacks (only destroys Pulumi resources, cluster remains)
STACK=baremetal pnpm cluster:teardown
STACK=aws       pnpm cluster:teardown
STACK=gcp       pnpm cluster:teardown
```

---

## Available scripts

| Script                  | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `pnpm cluster:setup`    | Creates registry + k3d cluster                      |
| `pnpm cluster:teardown` | Destroys stack and k3d cluster                      |
| `pnpm docker:push`      | Builds + pushes the 3 images to the local registry  |
| `pnpm preview:local`    | Preview the local stack without applying            |
| `pnpm up:local`         | Applies the local stack                             |
| `pnpm destroy:local`    | Destroys the local stack                            |
| `pnpm local`            | Setup + docker:push + up:local in sequence          |

---

## File structure

```
scripts/
├── setup-cluster.js      # Creates k3d cluster + registry (local only)
├── docker-push.js        # Builds + pushes all images
└── teardown-cluster.js   # Destroys stack (+ cluster for local)

src/
├── index.ts              # Main orchestrator
├── shared/
│   ├── config.ts         # All centralized config values
│   ├── types.ts          # Shared interfaces
│   ├── namespace.ts      # "app" Namespace
│   ├── ingress.ts        # NGINX via Helm + routing rules
│   ├── postgres.ts       # StatefulSet + PVC + Secret
│   ├── redis.ts          # StatefulSet + PVC + Secret
│   ├── minio.ts          # MinIO StatefulSet + Bucket creation Job
│   ├── storage-secret.ts # S3-compatible secrets for AWS and GCP
│   └── apps.ts           # Deployments + Services: api, web, doc
├── aws/
│   └── cluster.ts        # EKS + VPC Provisioning
├── gcp/
│   └── cluster.ts        # GKE + VPC Provisioning
└── baremetal/
    └── metallb.ts        # MetalLB Helm + IPAddressPool + L2Advertisement

Pulumi.yaml               # Project definition
Pulumi.local.yaml         # Local stack config (k3d)
Pulumi.baremetal.yaml     # Baremetal stack config
Pulumi.aws.yaml           # AWS stack config
Pulumi.gcp.yaml           # GCP stack config
```

---

## Health check convention

All containers must expose `GET /health` on their configured port.
The Kubernetes readiness and liveness probes depend on this endpoint.

| App | Port  | Health endpoint |
| --- | ----- | --------------- |
| api | 3333  | `GET /health`   |
| web | 3000  | `GET /health`   |
| doc | 3001  | `GET /health`   |
