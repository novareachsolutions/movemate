import {
  CONNECTION_TIMEOUT_MS,
  DB_CONNECTION_POOL_MAX,
  MAX_QUERY_EXECUTION_TIME,
} from '../../constants';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const createDataSource = async (): Promise<DataSource> => {
  const connectionOptions = {
    name: 'default',
    type: process.env.TYPEORM_CONNECTION,
    host: process.env.TYPEORM_HOST,
    port: Number(process.env.TYPEORM_PORT),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    synchronize: Boolean(process.env.TYPEORM_SYNCHRONIZE),
    maxQueryExecutionTime: MAX_QUERY_EXECUTION_TIME,
    connectionTimeoutMS: CONNECTION_TIMEOUT_MS,
    entities: [process.env.TYPEORM_ENTITIES],
    migrationsRun: false,
    migrationsTableName: process.env.TYPEORM_MIGRATIONS_TABLE_NAME,
    schema: process.env.TYPEORM_SCHEMA,
    migrations: [process.env.TYPEORM_MIGRATIONS],
    installExtensions: false,
    logger: 'advanced-console',
    extra: {
      max: DB_CONNECTION_POOL_MAX,
    },
    cli: {
      migrationsDir: process.env.TYPEORM_MIGRATIONS_DIR,
    },
  } as PostgresConnectionOptions;

  return new DataSource(connectionOptions);
};

export function primaryDataSource(): Promise<DataSource> {
  return createDataSource();
}
