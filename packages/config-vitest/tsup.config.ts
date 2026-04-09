import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/base.ts', 'src/nest.ts', 'src/next.ts', 'src/react.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
  external: [
    'vitest',
    'vitest/config'
  ]
});
