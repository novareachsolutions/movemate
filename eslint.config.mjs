import eslint from "@eslint/js";
import perfectionist from "eslint-plugin-perfectionist";
import eslintPrettierRecommended from "eslint-plugin-prettier/recommended";
import pluginPromise from "eslint-plugin-promise";
import tseslint from "typescript-eslint";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const off = 0,
  warn = 1,
  error = 2;

const rootConfig = [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  pluginPromise.configs["flat/recommended"],
  eslintPrettierRecommended,
  {
    name: "default",
    files: ["src/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
      perfectionist,
    },
    rules: {
      "no-console": error,
      "no-param-reassign": error,
      "no-restricted-imports": [
        warn,
        {
          name: "date-fns",
          message: "Please use luxon instead.",
        },
        {
          name: "moment",
          message: "Please use luxon instead.",
        },
      ],
      "no-restricted-properties": [
        error,
        ...[
          ["emerg", "error"],
          ["alert", "error"],
          ["crit", "error"],
          ["warning", "warn"],
          ["notice", "info"],
          ["help", "info"],
          ["data", "info"],
          ["prompt", "info"],
          ["http", "info"],
          ["verbose", "info"],
          ["input", "info"],
          ["silly", "info"],
        ].map(([property, alternative]) => ({
          object: "logger",
          property,
          message: `Use logger.${alternative} instead`,
        })),
      ],
      "no-return-await": off, // causes stack trace to omit some calls
      "require-await": error,
      "perfectionist/sort-enums": [error, { ignoreCase: false }],
      "perfectionist/sort-interfaces": [error, { ignoreCase: false }],
      "prettier/prettier": off,
      "promise/always-return": [error, { ignoreLastCallback: true }],
      "simple-import-sort/imports": error,
      "spaced-comment": error,
      "@typescript-eslint/explicit-function-return-type": error,
      "@typescript-eslint/member-ordering": warn,
      "@typescript-eslint/naming-convention": [
        warn,
        {
          selector: "enum",
          format: ["PascalCase"],
          suffix: ["Enum"],
        },
        {
          selector: "interface",
          format: ["PascalCase"],
          prefix: ["I"],
        },
        {
          selector: "typeAlias",
          format: ["PascalCase"],
          prefix: ["T"],
        },
      ],
      "@typescript-eslint/no-empty-interface": error,
      "@typescript-eslint/no-empty-object-type": error,
      "@typescript-eslint/no-explicit-any": off,
      "@typescript-eslint/no-floating-promises": error,
      "@typescript-eslint/no-unused-expressions": [
        error,
        { allowShortCircuit: true, allowTernary: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        warn,
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "comma-dangle": off,
    },
  },
];

export default rootConfig;
