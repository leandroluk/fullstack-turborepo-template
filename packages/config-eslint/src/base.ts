import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import prettier from 'eslint-plugin-prettier/recommended';
import turbo from 'eslint-plugin-turbo';
import {defineConfig} from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const baseConfig = defineConfig([
  // Ignora arquivos de configuração e pastas de build
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', '**/*.config.{mjs,cjs,ts,js}'],
  },

  // Configurações base do ESLint
  js.configs.recommended,

  // Configurações base do TypeScript
  tseslint.configs.recommendedTypeChecked,

  // Configurações base do Prettier
  prettier,

  // Configurações do plugin Turbo
  {
    plugins: {turbo},
    rules: {'turbo/no-undeclared-env-vars': 'warn'},
  },

  // Configurações do plugin Vitest
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    plugins: {vitest},
    rules: {
      ...vitest.configs.recommended.rules,
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
    languageOptions: {
      globals: globals.es2021,
    },
  },

  // Configurações globais
  {
    languageOptions: {
      globals: globals.es2021,
      parserOptions: {
        projectService: true,
      },
    },
  },

  // Regras gerais
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-array-constructor': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-warning-comments': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/camelcase': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'prettier/prettier': [
        'error',
        {
          bracketSpacing: false,
          singleQuote: true,
          trailingComma: 'es5',
          arrowParens: 'avoid',
          printWidth: 120,
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'describe',
          property: 'only',
        },
        {
          object: 'it',
          property: 'only',
        },
      ],
      'no-unneeded-ternary': 'error',
      'no-trailing-spaces': 'error',
      'block-scoped-var': 'error',
      'prefer-const': 'error',
      'eol-last': 'error',
      'prefer-arrow-callback': [
        'error',
        {
          allowNamedFunctions: true,
        },
      ],
      'n/no-extraneous-import': 'off',
      'n/no-missing-import': 'off',
      'n/no-empty-function': 'off',
      'n/no-unsupported-features/es-syntax': 'off',
      'n/no-missing-require': 'off',
      'n/shebang': 'off',
      'no-dupe-class-members': 'off',
      'no-var': 'error',
      'no-sparse-arrays': 'off',
      'require-atomic-updates': 'off',
      curly: ['error', 'all'],
      eqeqeq: 'error',
      quotes: [
        'warn',
        'single',
        {
          avoidEscape: true,
        },
      ],
    },
  },
]);

export default baseConfig;
