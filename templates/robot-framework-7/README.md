# @templates/robot-framework-7

This is a boilerplate template for **Robot Framework** automated testing environments, built within the Turborepo monorepo architecture. 

## Monorepo Context

Unlike the Node.js oriented templates, the E2E suite primarily runs utilizing Python tools (like `uv` and `ruff`). However, by existing as a Turborepo workspace package, it can be seamlessly orchestrated by the remote caching engine (`turbo run test:e2e`). 
It can also leverage dependencies running inside local containers or other Next.js/Nest.js nodes running in parallel.

## Available Scripts

- `pnpm run test:e2e` / `uv run robot`: Triggers the Robot Framework test execution.
- `pnpm run lint`: Validates the `.robot` and python test bindings.

## Usage

To create a new E2E testing suite bounded context:
1. Copy this directory into the `apps/` or `packages/` folder.
2. Rename the directory and update the `name` inside its `package.json`.
3. Update the Robot specifications and any necessary Python Keywords.
4. Trigger the pipelines alongside the Turborepo `test` sequence.
