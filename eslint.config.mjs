// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    rules: {
      // Allow unused variables that start with underscore
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // Prevent any types
      "@typescript-eslint/no-explicit-any": "error",

      // Basic code quality
      "prefer-const": "error",
      "no-var": "error",
    },
  },
  {
    ignores: ["node_modules/", "dist/", "coverage/", "*.js"],
  }
);
