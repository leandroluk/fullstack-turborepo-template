import nextConfig from "@packages/config-eslint/next";
import {defineConfig} from "eslint/config";

export default defineConfig([
  ...nextConfig,
  {languageOptions: {parserOptions: {tsconfigRootDir: import.meta.dirname}}}
]);
