<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:typescript-agent-rules -->
# TypeScript Agent Rules

## 1. Version Awareness

- **Current Version**: 6.0.2
- **Breaking Changes**: 
  - **`eslint-config-next`**: Version 16.x introduces breaking changes compared to previous versions. Always refer to `node_modules/next/dist/docs/` for the latest API documentation and migration guides.
  - **`typescript-eslint`**: Version 8.x has breaking changes. Refer to `node_modules/typescript-eslint/dist/docs/` for details.

## 2. Configuration

- **Configuration File**: `eslint.config.ts`
- **Base Configurations**:
  - `nextVitals`: Core web vitals rules from `eslint-config-next`.
  - `nextTs`: TypeScript rules from `eslint-config-next`.
- **Ignores**:
  - Uses `globalIgnores` to override default ignores from `eslint-config-next`.
  - Default ignores include: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`.

## 3. Best Practices

- **Type Safety**: Leverage TypeScript's type system to prevent runtime errors.
- **Immutability**: Prefer immutable data structures and avoid direct mutation of state.
- **Strict Mode**: Adhere to strict TypeScript settings (e.g., `strict: true`).

## 4. Migration

- When upgrading TypeScript or related packages, always check for breaking changes in `node_modules/typescript/dist/docs/` and `node_modules/typescript-eslint/dist/docs/`.
- Review `eslint.config.ts` for any configuration updates required by the new versions.

## 5. Common Pitfalls

- **Peer Dependency Mismatches**: Be aware of peer dependency warnings (e.g., `typescript-eslint` and `eslint-plugin-react` having unmet peer dependencies on `eslint`).
- **Version Skew**: Ensure all related packages (Next.js, TypeScript, ESLint) are compatible with each other.
<!-- END:typescript-agent-rules -->
