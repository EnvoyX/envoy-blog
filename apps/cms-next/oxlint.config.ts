import { defineConfig } from 'oxlint'

export default defineConfig({
  categories: {
    correctness: 'warn',
    style: 'warn',
  },
  rules: {
    'eslint/no-unused-vars': 'warn',
  },
  ignorePatterns: [
    '.next/',
    'src/payload-types.ts',
    'src/payload-generated-schema.ts',
    'node_modules/',
  ],
})
