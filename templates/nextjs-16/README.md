# @templates/nextjs-16

This is a boilerplate template for **Next.js 16 (React)** frontend architectures, created to integrate effortlessly within the Turborepo monorepo context.

## Monorepo Context

Designed specifically as a node in the Turborepo ecosystem, this template avoids local redundant configs. It points natively toward:
- **`@packages/config-eslint`**: Using the Next.js curated flat-configs.
- **`@packages/config-typescript`**: Providing maximum strictness constraints on top of the generic base structure.
- **`@packages/config-vitest`**: Using the React ecosystem presets for DOM validation.

The `turbo.json` implicitly covers its build procedures to aggressively cache `.next` outputs and eliminate unnecessary rebuilds across Vercel and CI environments.

## Available Scripts

- `pnpm run dev`: Starts the local Next.js development server.
- `pnpm run build`: Compiles the React application for production.
- `pnpm run start`: Serves the generated `.next` production build.
- `pnpm run lint`: Analyzes the code via ESLint.
- `pnpm run test`: Executes unit and integration tests under Vitest.

## Usage

To create a new web portal:
1. Copy this directory into the `apps/` folder.
2. Rename the directory and update the `name` property inside its `package.json`.
3. Tweak the global layout and generic `tailwind/css` bindings.
4. Run `pnpm install` at the monorepo root to link the workspaces.
