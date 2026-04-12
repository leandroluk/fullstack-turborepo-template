# {{company}} — Monorepo Template

Welcome to the **{{company}}** central repository. This workspace is orchestrated by [Turborepo](https://turbo.build/) to manage microservices, frontends, and shared libraries in a unified development environment.

## 🏗️ Architecture & Tech Stack

### Templates (`templates/`)
Ready-to-use project foundations that consume shared configurations.

| Template                                                             | Technology                                          | Purpose                                                  |
| :------------------------------------------------------------------- | :-------------------------------------------------- | :------------------------------------------------------- |
| **[`nestjs-11`](./templates/nestjs-11)**                             | [NestJS 11](https://nestjs.com/)                    | Robust backend API with module-based architecture.       |
| **[`nextjs-16`](./templates/nextjs-16)**                             | [Next.js 16](https://nextjs.org/)                   | Modern web frontend with App Router and Tailwind CSS.    |
| **[`expo-55`](./templates/expo-55)**                                 | [Expo 55](https://expo.dev/)                        | Cross-platform mobile app with React Native.             |
| **[`nextra-4`](./templates/nextra-4)**                               | [Nextra 4](https://nextra.site/)                    | Documentation site with MDX support.                     |
| **[`pulumi-3`](./templates/pulumi-3)**                               | [Pulumi](https://www.pulumi.com/)                   | K8s Infrastructure-as-Code (Local, AWS, GCP, Baremetal). |
| **[`aws-lambda-powertools-2`](./templates/aws-lambda-powertools-2)** | [AWS Powertools](https://powertoolst.awsdev.io/)    | Serverless functions with SAM CLI integration.           |
| **[`serverless-framework-3`](./templates/serverless-framework-3)**   | [Serverless Framework](https://www.serverless.com/) | FaaS deployments with Offline emulation.                 |
| **[`robot-framework-7`](./templates/robot-framework-7)**             | [Robot Framework](https://robotframework.org/)      | End-to-end automated testing suite.                      |

### Packages (`packages/`)
Shared logic and configurations used by all workspaces.

| Package                                                 | Description                                                       |
| :------------------------------------------------------ | :---------------------------------------------------------------- |
| **[`config-eslint`](./packages/config-eslint)**         | Unified Flat Config for ESLint (Next.js, NestJS, Expo, etc.).     |
| **[`config-typescript`](./packages/config-typescript)** | Standardized `tsconfig.json` bases.                               |
| **[`config-vitest`](./packages/config-vitest)**         | Shared Vitest presets for unit and integration testing.           |
| **[`shared-domain`](./packages/shared-domain)**         | Domain logic, Zod schemas, and interfaces shared across the repo. |

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
pnpm turbo dev
```

To focus on a specific template:

```sh
pnpm turbo dev --filter=@templates/nestjs-11
```

### Infrastructure & Resilience Testing

This template is designed for high-fidelity local environments.

1. **Local K8s** — deploy the entire stack to a local cluster (k3d) via Pulumi:
   ```sh
   cd templates/pulumi-3
   pnpm local
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
pnpm turbo test

# Watch mode for a specific package
pnpm turbo test --filter=@templates/nestjs-11 -- --watch
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
