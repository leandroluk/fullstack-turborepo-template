import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import {defineConfig} from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import baseConfig from './base';

const reactConfig = defineConfig([
  // Base configurations
  ...baseConfig,

  // ESLint configurations
  js.configs.recommended,

  // Prettier configurations
  eslintConfigPrettier,

  // TypeScript configurations
  ...tseslint.configs.recommended,

  // React configurations
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },

  // React Hooks configurations
  // Note: version is declared explicitly to avoid using context.getFilename()
  // removed in ESLint 10 — while eslint-plugin-react@7.x is not updated.
  {
    plugins: {'react-hooks': pluginReactHooks},
    settings: {react: {version: '19'}},
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
  },
]);

export default reactConfig;
