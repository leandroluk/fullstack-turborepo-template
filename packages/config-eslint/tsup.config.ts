import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/base.ts', 'src/nest.ts', 'src/next.ts', 'src/react.ts', 'src/expo.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
  external: [
    '@eslint/js',
    '@next/eslint-plugin-next',
    '@vitest/eslint-plugin',
    'eslint',
    'eslint-config-expo',
    'eslint-config-expo/flat.js',
    'eslint-config-prettier',
    'eslint-plugin-only-warn',
    'eslint-plugin-prettier',
    'eslint-plugin-react',
    'eslint-plugin-react-hooks',
    'eslint-plugin-turbo',
    'globals',
    'typescript-eslint',
    'eslint/config'
  ]
});
