/// <reference types="vitest" />
import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig} from 'vitest/config';

const baseConfig = defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {alias: {'#': 'src'}},
  test: {
    globals: true,
    include: ['test/**/*.{e2e-test,test,spec}.{js,jsx,ts,tsx}', 'src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './.coverage',
      include: ['src/**/*.{ts,js,tsx,jsx}'],
      exclude: ['**/index.ts', '**/*.d.ts'],
    },
  },
});

export default baseConfig;
