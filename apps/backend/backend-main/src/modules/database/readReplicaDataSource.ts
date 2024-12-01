import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

import configuration from "../../config/configuration";
import {
  CONNECTION_TIMEOUT_MS,
  DB_CONNECTION_POOL_MAX,
  DB_READ_NAME,
  DB_READ_PORT,
  MAX_QUERY_EXECUTION_TIME,
} from "../../constants";

const config = configuration();

const createDataSource = (): DataSource => {
  const connectionOptions = {
    name: DB_READ_NAME,
    type: config.database.type,
    host: config.database.host,
    port: DB_READ_PORT,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    synchronize: config.database.synchronize,
    maxQueryExecutionTime: MAX_QUERY_EXECUTION_TIME,
    connectionTimeoutMS: CONNECTION_TIMEOUT_MS,
    entities: config.database.entities,
    migrationsRun: false,
    migrationsTableName: config.database.migrationsTableName,
    schema: config.database.schema,
    migrations: config.database.migrations,
    installExtensions: false,
    logger: "advanced-console",
    extra: {
      max: DB_CONNECTION_POOL_MAX,
    },
  } as PostgresConnectionOptions;

  return new DataSource(connectionOptions);
};

export function readReplicaDataSource(): DataSource {
  return createDataSource();
}
