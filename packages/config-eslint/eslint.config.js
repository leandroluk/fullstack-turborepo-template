import {defineConfig} from 'tsup';
import baseConfig from './dist/base.js';

export default defineConfig([
  ...baseConfig,
  {languageOptions: {parserOptions: {tsconfigRootDir: import.meta.dirname}}}
]);
