/// <reference types="vitest" />
import {defineConfig, mergeConfig} from 'vitest/config';
import baseConfig from './base';

const {include = [], exclude = []} = baseConfig.test?.coverage as any;

const nestConfig = mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: 'node',
      coverage: {
        include,
        exclude: [...exclude, 'src/main.ts'],
      },
    },
  })
);

export default nestConfig;
