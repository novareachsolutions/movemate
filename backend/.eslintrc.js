const off = 0,
  warn = 1,
  error = 2;

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  extends: ['../.eslintrc.js', 'plugin:@typescript-eslint/recommended'],
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    // backend specific rules goes here
  },
};
