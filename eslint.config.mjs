import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([".next/**", "out/**", "node_modules/**", "next-env.d.ts"]),
]);
