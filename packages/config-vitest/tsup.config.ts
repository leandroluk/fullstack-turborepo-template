import {defineConfig} from 'tsup'

export default defineConfig({
  entry: ['src/base.ts', 'src/nest.ts', 'src/next.ts', 'src/react.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  platform: 'node',
  splitting: true,
  external: [
    'vitest',
    'vitest/config',
    'vite',
    '@vitest/config',
    'vite-tsconfig-paths',
    '@vitest/coverage-v8',
  ],
})