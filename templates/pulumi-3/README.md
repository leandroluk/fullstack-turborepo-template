# @templates/pulumi-3

This is a boilerplate template for Infrastructure as Code utilizing **Pulumi** to manage **Kubernetes** architectures within the Turborepo monorepo.

## Monorepo Context

As a Turborepo template, this allows your Infrastructure code to be versioned, cached, and linted under the same ecosystem as your frontend and backend projects. By unifying it in the monorepo, Pulumi scripts can import exact Domain definitions and configurations exported by other monorepo workspaces via Typescript.

It takes full advantage of:
- **`@packages/config-eslint`**: Assuring the Pulumi scripts follow clean-code guidelines.
- **`@packages/config-typescript`**: Shared typing conventions.

## Available Scripts

- `pnpm run up`: Executes Pulumi up to provision the K8s cluster and state.
- `pnpm run preview`: Previews infrastructure changes without committing them.
- `pnpm run deploy`: Standard Turborepo mapping.
- `pnpm run lint`: Evaluates Pulumi TypeScript configuration statically.

## Usage

To create a new infrastructure domain:
1. Copy this directory into the `apps/` folder (or `infra/`).
2. Rename the directory and update the `name` inside its `package.json`.
3. Adjust the namespaces, ingress constraints, and subdomains (e.g. `*.127.0.0.1.nip.io`).
4. Run `pnpm install` at the root and login to the targeted Pulumi backend.
