/* eslint-disable @typescript-eslint/no-unused-vars */
import rootConfig from "../../../eslint.config.mjs";

const off = 0;
const warn = 1;
const error = 2;

export default [
  ...rootConfig,
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-console": error,
      // Explicitly turn off no-explicit-any
      "@typescript-eslint/no-explicit-any": off,
      // Keep the unused vars configuration for _client
      "@typescript-eslint/no-unused-vars": [
        error,
        {
          args: "all",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    ignores: ["out", "node_modules", "src/migrations/**"],
  },
];
