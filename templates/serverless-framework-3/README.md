# @templates/serverless-framework-3

This is a boilerplate template for creating **Serverless Framework v3** deployments, seamlessly integrated within the Turborepo monorepo architectures.

## Monorepo Context

As a Turborepo workspace, this project leverages local monorepo configurations to unify code quality and type safety:
- **`@packages/config-eslint`**: Ensuring handlers strictly follow the repo's base styling rules.
- **`@packages/config-typescript`**: Validating Lambda handler typings against shared schemas.
- **`@packages/config-vitest`**: Standardizing unit test pipelines.

By centralizing configuration in `packages/`, all generated serverless microservices will share identical rulesets, reducing configuration overhead immensely.

## Available Scripts

- `pnpm run dev`: Binds the `serverless-offline` plugin for local API Gateway emulation.
- `pnpm run dev:debug`: Binds `serverless-offline` while attaching the NodeJS inspector (Port 9229) for VS Code Debugging natively.
- `pnpm run build`: Triggers the Serverless Packaging sequence.
- `pnpm run lint`: Evaluates statically parsed TypeScript configurations via ESLint.
- `pnpm run test`: Checks handler integrity using Vitest.

## Usage

To generate a new independent microservice based on this setup:
1. Copy this directory into the `apps/` folder.
2. Rename the directory and update the `name` property inside its `package.json`.
3. Remap your endpoints inside `serverless.yml`.
4. Run `pnpm install` at the monorepo root to link the workspaces.
