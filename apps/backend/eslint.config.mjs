/* eslint-disable @typescript-eslint/no-unused-vars */
import rootConfig from '../../../eslint.config.mjs';

const off = 0;
const warn = 1;
const error = 2;

export default [
  ...rootConfig,
  {
    ignores: ['out', 'node_modules', 'src/migrations/**'],
  },
];
