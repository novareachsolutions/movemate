import * as winston from "winston";

import configuration from "./config/configuration";

const config = configuration();

export const logger = winston.createLogger({
  level: config.environment === "production" ? "warn" : "info",
  format: winston.format.cli(),
  defaultMeta: { environment: config.environment },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});
