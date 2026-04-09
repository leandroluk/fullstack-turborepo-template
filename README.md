# {{company}} — Monorepo Template

Welcome to the **{{company}}** central repository. This workspace is orchestrated by [Turborepo](https://turbo.build/) to manage microservices, frontends, and shared libraries in a unified development environment.

## 🏗️ Architecture & Tech Stack

### Applications (`apps/`)

| App                | Description                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------- |
| **`template-api`** | Backend service built with [NestJS](https://nestjs.com/)                                      |
| **`template-web`** | Main web frontend using [Next.js](https://nextjs.org/) (App Router)                           |
| **`template-app`** | Mobile application powered by [React Native](https://reactnative.dev/)                        |
| **`template-doc`** | Documentation site built with [Nextra](https://nextra.site/)                                  |
| **`template-k8s`** | Infrastructure-as-Code (IaC) using [Pulumi](https://www.pulumi.com/) and Kubernetes manifests |

### Packages (`packages/`)

| Package                 | Description                                                            |
| ----------------------- | ---------------------------------------------------------------------- |
| **`config-eslint`**     | Shared ESLint configurations (Next.js, NestJS, Prettier)               |
| **`config-typescript`** | Base `tsconfig.json` files used across the workspace                   |
| **`config-vitest`**     | Global Vitest configurations for unit and integration testing          |
| **`shared-types`**      | Zod schemas and TypeScript interfaces shared between API and frontends |

---

## 🏁 Getting Started

### Prerequisites

- **Node.js**: v20+ (LTS recommended)
- **pnpm**: v9+
- **Turborepo**: `npm install -g turbo`

### Installation

```sh
git clone --recursive <repo-url>
cd my-monorepo
pnpm install
```

### Environment Variables

Environment variables are managed via a **root-level `.env` file**.
Turborepo is configured with `globalDotEnv` to automatically inject these variables into the relevant workspaces and manage the build cache.

```sh
cp .env.example .env
```

> [!NOTE]
> Variables that change frequently but don't affect the build output (e.g. `DEBUG_LEVEL`) should be moved to a local `.env` inside the specific app folder. Any change to the root `.env` will invalidate the cache for all tasks.

---

## 🔄 Development Workflow

### Running Locally

To start all applications in development mode:

```sh
turbo dev
```

To focus on a specific application:

```sh
turbo dev --filter=template-api
```

### Infrastructure & Resilience Testing

This template is designed for high-fidelity local environments.

1. **Local K8s** — deploy the entire stack to a local cluster (Kind/Minikube) via Pulumi:
   ```sh
   cd apps/template-k8s
   pulumi up
   ```
2. **Pentesting** — use the local Kubernetes deployment to run security scans and resilience tests (chaos engineering) without affecting cloud resources.

---

## ✅ Quality Gates

### Git Hooks

We use [Lefthook](https://github.com/evilmartians/lefthook) to manage Git hooks efficiently.

- **Pre-commit**: Runs `turbo lint`, `typecheck`, and `format` only on staged files.
- **Commit-msg**: Validates commit messages using `commitlint` (Conventional Commits).

### Testing

We use [Vitest](https://vitest.dev/) for high-performance testing:

```sh
# Run all tests
turbo test

# Watch mode for a specific app
turbo test --filter=template-api -- --watch
```

---

## 🚀 Build & Deployment

### Build Pipeline

Turborepo handles the build graph. If you change a shared package, Turbo knows exactly which apps need to be rebuilt.

```sh
turbo build
```

### Remote Caching

To share build artifacts across the team and CI/CD, configure Remote Caching:

```sh
turbo login
turbo link
```

---

## 🔗 Useful Links

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Pulumi Kubernetes Guides](https://www.pulumi.com/registry/packages/kubernetes/)
- [Conventional Commits](https://www.conventionalcommits.org/)
