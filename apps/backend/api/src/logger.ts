import * as winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.cli(),
  defaultMeta: { environment: process.env.ENVIRONMENT },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});
