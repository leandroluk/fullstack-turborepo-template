import expoConfig from 'eslint-config-expo/flat.js';
import {defineConfig} from 'eslint/config';
import baseConfig from './base';

const config = defineConfig([
  // Base configurations
  ...baseConfig,

  // Expo configurations
  expoConfig,
]);

export default config;
