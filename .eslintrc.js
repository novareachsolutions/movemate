const off = 0, warn = 1, error = 2;
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    "no-console": error,
    "no-param-reassign": error,
    "require-await": error,
    "pretter/prettier": [
      error,
      {
        endOfLine: 'auto',
      },
    ],
    '@typescript-eslint/interface-name-prefix': [error, { "prefixWithI": "always" }],
    '@typescript-eslint/explicit-function-return-type': error,
    '@typescript-eslint/no-explicit-any': warn,
    '@typescript-eslint/no-unused-vars': error,
    '@typescript-eslint/no-floating-promises': error,
    '@typescript-sort-keys/interface': error,
    '@typescript-sort-keys/string-enum': error,
  },
};
