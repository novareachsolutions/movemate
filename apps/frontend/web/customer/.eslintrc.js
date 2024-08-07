const off = 0,
  warn = 1,
  error = 2;

module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint"],
  extends: ["../../.eslintrc.js", "next/core-web-vitals"],
  ignorePatterns: [".eslintrc.js"],
  rules: {
    // customer web app specific rules goes here
  },
  includes: ["**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
};
