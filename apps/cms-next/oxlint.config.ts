import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "warn",
    style: "warn",
  },
  ignorePatterns: [
    ".next/",
    "src/payload-types.ts",
    "src/payload-generated-schema.ts",
    "node_modules/",
  ],
  rules: {
    "eslint/no-unused-vars": "warn",
  },
});
