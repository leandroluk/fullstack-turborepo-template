# @templates/nestjs-11

This is a boilerplate template for **NestJS (v11+)** designed to be used within the Turborepo monorepo architecture. 

## Monorepo Context

As a Turborepo template, this project is pre-configured to utilize the shared conventions and tooling defined in `packages/*`. It relies symmetrically on the workspace to ensure standardization across all backend services:
- **`@packages/config-eslint`**: For consistent static analysis and code styling.
- **`@packages/config-typescript`**: For shared Type-Safety standards and absolute paths.
- **`@packages/config-vitest`**: For uniform unit testing setups.

Rather than maintaining duplicate configuration files, this template references the root monorepo implementations, keeping the repository DRY.

## Available Scripts

- `pnpm run dev` / `pnpm run start`: Starts the local NestJS development server.
- `pnpm run debug`: Starts the development server with debugger mapping.
- `pnpm run build`: Compiles the Nest application for production.
- `pnpm run lint`: Analyzes the code via ESLint.
- `pnpm run test`: Executes Vitest tests.

## Usage

To spin up a new API microservice based on this footprint:
1. Copy this directory into the `apps/` folder.
2. Rename the directory and update the `name` property inside its `package.json`.
3. Add any domain-specific dependencies.
4. Run `pnpm install` at the monorepo root to link the workspaces.
