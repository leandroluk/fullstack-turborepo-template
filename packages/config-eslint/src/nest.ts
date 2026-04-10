import {defineConfig} from 'eslint/config';
import globals from 'globals';
import baseConfig from './base';

const nestConfig = defineConfig([
  // Configurações base
  ...baseConfig,

  // Configurações globais
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]);

export default nestConfig;
