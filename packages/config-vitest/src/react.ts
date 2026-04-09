/// <reference types="vitest" />
import {defineConfig, mergeConfig} from 'vitest/config';
import baseConfig from './base';

const reactConfig = mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.tsx', 'test/**/*.{test,spec}.tsx'],
    },
  })
);

export default reactConfig;
