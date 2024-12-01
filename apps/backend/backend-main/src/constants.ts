import { logger } from "./logger";

export const DB_READ_NAME = "read";
export let DB_READ_PORT = Number(process.env.DB_READ_PORT);
if (!DB_READ_PORT) {
  logger.warn("DB_READ_PORT is not configured. Read replica will not be used.");
  DB_READ_PORT = Number(process.env.TYPEORM_PORT);
}
export const MAX_QUERY_EXECUTION_TIME = 7000;
export const CONNECTION_TIMEOUT_MS = 60000;
export const DB_CONNECTION_POOL_MAX = process.env.DB_CONNECTION_POOL_MAX || 10;
