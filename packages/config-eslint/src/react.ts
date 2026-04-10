import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import {defineConfig} from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import baseConfig from './base';

const reactConfig = defineConfig([
  // Configurações base
  ...baseConfig,

  // Configurações do ESLint
  js.configs.recommended,

  // Configurações do Prettier
  eslintConfigPrettier,

  // Configurações do TypeScript
  ...tseslint.configs.recommended,

  // Configurações do React
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },

  // Configurações do React Hooks
  // Nota: a versão é declarada explicitamente para evitar o uso de context.getFilename()
  // removido no ESLint 10 — enquanto o eslint-plugin-react@7.x não é atualizado.
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
