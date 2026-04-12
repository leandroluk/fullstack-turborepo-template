import baseConfig from '@packages/config-eslint/base';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  ...baseConfig,
  { languageOptions: { parserOptions: { tsconfigRootDir: __dirname } } },
]);
