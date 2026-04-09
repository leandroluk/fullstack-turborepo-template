/// <reference types="vitest" />
import {defineConfig, mergeConfig} from 'vitest/config';
import baseConfig from './base';

const nextConfig = mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['src/**/*.{test,spec}.tsx', 'test/**/*.{test,spec}.tsx'],
    },
  })
);

export default nextConfig;
