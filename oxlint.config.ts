import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "warn",
  },
  rules: {
    "eslint/no-unused-vars": "warn",
  },
  options: { typeAware: true, typeCheck: true },
});
