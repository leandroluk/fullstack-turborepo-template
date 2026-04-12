# @templates/nextra-4

This is a boilerplate template for creating documentation sites using **Next.js 16 + Nextra 4.6+**, designed specifically within the Turborepo monorepo ecosystem.

## Monorepo Context

As a Turborepo template, this project is pre-configured to utilize the shared conventions and tooling defined in `packages/*`:
- **`@packages/config-eslint`**: Specifically using the Next.js target configurations.
- **`@packages/config-typescript`**: Reusing standard domain typings where applicable.

This setup prevents isolated configuration drifting, keeping Nextra guidelines perfectly compliant with the rest of the web repositories in the monorepo.

## Available Scripts

- `pnpm run dev`: Starts the local Next.js development server for Nextra.
- `pnpm run build`: Generates the static HTML outputs or standard Next production build.
- `pnpm run start`: Serves the production build locally.
- `pnpm run lint`: Analyzes the code via ESLint.

## Usage

To spin up a new documentation portal:
1. Copy this directory into the `apps/` folder.
2. Rename the directory and update the `name` property inside its `package.json`.
3. Add your Markdown/MDX content into the `pages/` (or equivalent) directory.
4. Run `pnpm install` at the monorepo root to link the workspaces.
