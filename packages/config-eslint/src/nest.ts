import {defineConfig} from 'eslint/config';
import globals from 'globals';
import baseConfig from './base';

const nestConfig = defineConfig([
  // Base configurations
  ...baseConfig,

  // Global configurations
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]);

export default nestConfig;
