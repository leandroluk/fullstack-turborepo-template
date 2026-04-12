Tens razão, falha minha. Segue o `README.md` atualizado mantendo o padrão original em inglês, incluindo o novo provider **Hetzner (hcloud)**.

---

# k8s — Pulumi Kubernetes Template

Deploys the full **fullstack-turborepo-template** stack to Kubernetes using TypeScript + Pulumi.

Supports five providers via `k8s:provider`:

| Provider    | Cluster           | Object Storage | Reference Stack         |
| ----------- | ----------------- | -------------- | ----------------------- |
| `local`     | k3d (Docker)      | MinIO          | `Pulumi.local.yaml`     |
| `baremetal` | Existing cluster  | MinIO          | `Pulumi.baremetal.yaml` |
| `hcloud`    | K3s (Hetzner)     | MinIO          | `Pulumi.hcloud.yaml`    |
| `aws`       | EKS (provisioned) | Native S3      | `Pulumi.aws.yaml`       |
| `gcp`       | GKE (provisioned) | GCS via HMAC   | `Pulumi.gcp.yaml`       |

---

## Deployed Stack (all providers)

| Resource                      | Kind                 | Detail                      |
| ----------------------------- | -------------------- | --------------------------- |
| `app` namespace               | Namespace            | Isolates all workloads      |
| NGINX Ingress Controller      | Helm Release         | Traefik disabled in k3s/k3d |
| PostgreSQL 16                 | StatefulSet + PVC    | 5 Gi                        |
| Redis 7                       | StatefulSet + PVC    | 1 Gi, AOF enabled           |
| `api` (NestJS)                | Deployment + Service | port 3333                   |
| `web` (Next.js)               | Deployment + Service | port 3000                   |
| `doc` (Nextra)                | Deployment + Service | port 3001                   |
| Ingress rules                 | Ingress              | Subdomain routing           |
| **MinIO** *(local/bm/hcloud)* | StatefulSet + PVC    | 10 Gi, port 9000/9001       |
| **MetalLB** *(baremetal)*     | Helm Release + CRDs  | L2 LoadBalancer             |

---

## Prerequisites

| Provider    | Tools                                               |
| ----------- | --------------------------------------------------- |
| `local`     | [k3d](https://k3d.io/) + Docker + Pulumi CLI + pnpm |
| `baremetal` | kubectl pointing to the cluster + Pulumi CLI + pnpm |
| `hcloud`    | Hetzner API Token + Pulumi CLI + pnpm               |
| `aws`       | Configured AWS CLI + Pulumi CLI + pnpm              |
| `gcp`       | Configured gcloud + Pulumi CLI + pnpm               |

---

## Hetzner flow (hcloud)

```bash
# 1. Adjust Pulumi.hcloud.yaml:
#    - k8s:baseDomain         → Your domain or nip.io
#    - k8s:hcloudServerType   → e.g., cx22
#    - k8s:hcloudLocation     → e.g., nbg1

# 2. Set Secrets
pulumi config set --secret hcloud:token          your_hetzner_token --stack hcloud
pulumi config set --secret k8s:postgresPassword  yourpassword        --stack hcloud
pulumi config set --secret k8s:redisPassword     yourpassword        --stack hcloud
pulumi config set --secret k8s:minioRootPassword yourpassword        --stack hcloud

# 3. Deploy (provisions VPC + Firewall + Server + K3s)
pnpm up --stack hcloud
```

---

## Storage variables injected into pods

All providers inject the same set of S3-compatible variables.
The application code does not need to know which provider is in use.

```
S3_ENDPOINT   → MinIO (local/bm/hcloud) | S3 endpoint (aws) | GCS interop (gcp)
S3_BUCKET     → Bucket name
S3_ACCESS_KEY → Access key
S3_SECRET_KEY → Secret key
S3_REGION     → Region (MinIO ignores it, but SDKs require it)
S3_USE_SSL    → "true" (aws/gcp) | "false" (local/bm/hcloud)
```

---

## Teardown

```bash
# Destroys all stack resources (VMs, LBs, Firewalls, etc.)
pulumi destroy --stack hcloud
```

---

## File structure

```
src/
├── index.ts              # Main orchestrator (includes hcloud switch)
├── hcloud/
│   └── cluster.ts        # Hetzner Cloud provisioner (K3s + Networking)
├── shared/
│   ├── config.ts         # Centralized config (includes hcloudToken, etc.)
│   ├── apps.ts           # Workloads
│   └── ...
├── aws/
├── gcp/
└── baremetal/
```

---

## Health check convention

All containers must expose `GET /health` on their configured port.
The Kubernetes readiness and liveness probes depend on this endpoint.