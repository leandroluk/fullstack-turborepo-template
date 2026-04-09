import nestConfig from '@packages/config-eslint/nest';
import {defineConfig} from 'eslint/config';

export default defineConfig([
  ...nestConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  },
]);
