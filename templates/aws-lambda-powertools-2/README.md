# @templates/aws-lambda-powertools-2

This is a boilerplate template for **AWS Lambda Functions using AWS Lambda Powertools for TypeScript**, intended to be used within the Turborepo monorepo architecture. It comes pre-configured with the core Logger, Metrics, and Tracer utilities.

## Monorepo Context

As a Turborepo template, this project is pre-configured to utilize the shared tooling defined in `packages/*`. It interacts with the workspace to ensure code quality:
- **`@packages/config-eslint`**: For consistent static analysis.
- **`@packages/config-typescript`**: For shared Type-Safety standards.
- **`@packages/config-vitest`**: For uniform unit testing setups.

Rather than maintaining duplicate configuration files, this template references the root monorepo implementations, meaning your Lambda handlers are formatted and validated with the exact same rules as the core APIs.

## Prerequisites

You **must** have installed on your machine:
- [Docker](https://www.docker.com/) (running in the background)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

## Available Scripts

- `pnpm run build`: Bundles the lambda handler using `esbuild`.
- `pnpm run dev`: Submits a local HTTP server using SAM on port 3000 (Uses a fallback Docker image from DockerHub instead of AWS ECR).
- `pnpm run dev:debug`: Same as `dev` but attaches the NodeJS inspector (Port 9229) for VS Code integration.
- `pnpm run lint`: Analyzes the code via ESLint.
- `pnpm run test`: Executes unit tests via Vitest.

## Usage

To generate a new vanilla Lambda application based on Powertools from this footprint:
1. Copy this directory into the `apps/` or `services/` folder.
2. Rename the directory and update the `name` property inside its `package.json`.
3. Map your endpoints strictly in the `template.yaml` using the AWS Serverless Application Model schema.
4. Update `src/index.ts` with your custom business logic.
5. Run `pnpm install` at the monorepo root to link the workspaces.
