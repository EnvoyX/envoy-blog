import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,

  // Style Preferences (matching original prettier config)
  singleQuote: true,
  trailingComma: "all",
  semi: false,
  bracketSpacing: true,

  // Built-in Productivity Features
  sortImports: true,
  sortPackageJson: true,

  // Tailwind CSS Native Support
  tailwindAttributes: ["className", "class", "containerClassName"],
  tailwindFunctions: ["clsx", "twMerge", "cn"],

  // JSDoc Formatting
  jsdoc: {
    addDefaultToDescription: true,
    commentLineStrategy: "singleLine",
    verticalAlignment: true,
  },

  // Ignore patterns (matching original .prettierignore)
  ignorePatterns: [
    "**/payload-types.ts",
    ".tmp",
    "**/.git",
    "**/.hg",
    "**/.pnp.*",
    "**/.svn",
    "**/.yarn/**",
    "**/build",
    "**/dist/**",
    "**/node_modules",
    "**/temp",
    "**/docs/**",
    "tsconfig.json",
  ],
});
