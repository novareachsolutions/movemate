import configuration from "./config/configuration";
import { logger } from "./logger";

const config = configuration();

export const DB_READ_NAME = "read";
export let DB_READ_PORT = config.database.read_port;
if (!DB_READ_PORT) {
  logger.warn("DB_READ_PORT is not configured. Read replica will not be used.");
  DB_READ_PORT = config.database.port;
}
export const MAX_QUERY_EXECUTION_TIME = 7000;
export const CONNECTION_TIMEOUT_MS = 60000;
export const DB_CONNECTION_POOL_MAX = config.database.poolMax || 10;
