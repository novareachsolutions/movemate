const off = 0,
  warn = 1,
  error = 2;

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  ignorePatterns: [".eslintrc.js"],
  plugins: [
    "@typescript-eslint",
    "prettier",
    "promise",
    "typescript-sort-keys",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  rules: {
    "no-console": error,
    "no-param-reassign": error,
    "require-await": error,
    "prettier/prettier": [
      error,
      {
        endOfLine: "auto",
      },
    ],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "interface",
        format: ["PascalCase"],
        prefix: ["I"],
      },
    ],
    "@typescript-eslint/explicit-function-return-type": error,
    "@typescript-eslint/no-explicit-any": warn,
    "@typescript-eslint/no-unused-vars": error,
    "@typescript-eslint/no-floating-promises": error,
    "typescript-sort-keys/interface": error,
    "typescript-sort-keys/string-enum": error,
    "sort-keys": ["error", "asc", { caseSensitive: true, natural: false }],
  },
};
