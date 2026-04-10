import expoConfig from 'eslint-config-expo/flat.js';
import {defineConfig} from 'eslint/config';
import baseConfig from './base';

const config = defineConfig([
  // Configurações base
  ...baseConfig,

  // Configurações do Expo
  expoConfig,
]);

export default config;
