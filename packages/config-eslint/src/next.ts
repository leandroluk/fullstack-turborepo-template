import js from '@eslint/js';
import pluginNext from '@next/eslint-plugin-next';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import {defineConfig, globalIgnores} from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import baseConfig from './base';

const nextConfig = defineConfig([
  // Base configurations
  ...baseConfig,

  // ESLint configurations
  js.configs.recommended,

  // Prettier configurations
  eslintConfigPrettier,

  // TypeScript configurations
  ...tseslint.configs.recommended,

  // Global configurations
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),

  // React configurations
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
      },
    },
  },

  // Next.js configurations
  {
    plugins: {'@next/next': pluginNext as any},
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
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

export default nextConfig;
