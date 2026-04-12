# @templates/expo-55

This is a boilerplate template for **React Native with Expo (v55+)** designed to be used within the Turborepo monorepo architecture.

## Monorepo Context

As a Turborepo template, this project is pre-configured to utilize the shared conventions and tooling defined in `packages/*`. It relies symmetrically on the workspace to ensure standardization across all frontend native apps:
- **`@packages/config-eslint`**: Enforces best practices using the central Expo/React custom rules.
- **`@packages/config-typescript`**: Enforces strict TypeScript adherence for React Native.

Rather than maintaining duplicate configuration files, this template references the root monorepo implementations natively.

## Available Scripts

- `pnpm run dev`: Starts the local Expo development server.
- `pnpm run build`: Initiates EAS or local builds.
- `pnpm run lint`: Analyzes the code via ESLint.

## Usage

To create a new mobile application based on this footprint:
1. Copy this directory into the `apps/` folder.
2. Rename the directory and update the `name` property inside its `package.json` and `app.json`.
3. Set up Expo services if necessary.
4. Run `pnpm install` at the monorepo root to link the workspaces.
