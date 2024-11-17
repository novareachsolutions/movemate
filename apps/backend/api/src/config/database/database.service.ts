import { logger } from 'src/logger';
import {
  BaseEntity,
  DataSource,
  EntityTarget,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { primaryDataSource } from './primaryDataSource';
import { readReplicaDataSource } from './readReplicaDataSource';

export class DatabaseService {
  private static instance: DatabaseService = null;

  private primaryDataSource: DataSource;
  private secondaryDataSource: DataSource;

  public static async initialize() {
    if (DatabaseService.instance === null) {
      DatabaseService.instance = new DatabaseService();
      await DatabaseService.instance.connect();
    }
  }

  public static async stop(): Promise<void> {
    if (DatabaseService.instance) {
      await DatabaseService.instance.close();
      DatabaseService.instance = null;
    }
  }

  public async connect(): Promise<void> {
    if (!this.primaryDataSource?.isInitialized) {
      logger.info('Connecting to the database...');
      this.primaryDataSource = await primaryDataSource();
      await this.primaryDataSource.initialize();
      logger.info('Connection to the database established');
    }

    if (!this.secondaryDataSource?.isInitialized) {
      logger.info('Connecting to the read replica database...');
      this.secondaryDataSource = await readReplicaDataSource();
      await this.secondaryDataSource.initialize();
      logger.info('Connection to the read replica database established');
    }
  }

  public async close(): Promise<void> {
    if (this.primaryDataSource?.isInitialized) {
      logger.info('Closing connection to the database...');
      await this.primaryDataSource.destroy();
      logger.info('Connection to the database closed');
    }

    if (this.secondaryDataSource?.isInitialized) {
      logger.info('Closing read replica connection to the database...');
      await this.secondaryDataSource.destroy();
      logger.info('Read replica connection to the database closed');
    }
  }

  public static getRepository<T>(entity: EntityTarget<T>): Repository<T> {
    const baseRepository =
      DatabaseService.instance.primaryDataSource.getRepository<T>(entity);
    return new Proxy(baseRepository, DatabaseService.methodInterceptor());
  }

  public static getReadReplicaRepository<T>(
    entity: EntityTarget<T>,
  ): Repository<T> {
    const readReplicaRepository =
      DatabaseService.instance.secondaryDataSource.getRepository<T>(entity);
    return new Proxy(
      readReplicaRepository,
      DatabaseService.methodInterceptor(),
    );
  }

  public static executeQuery<T>(query: string, parameters?: any[]): Promise<T> {
    return DatabaseService.instance.primaryDataSource.manager.query<T>(
      query,
      parameters,
    );
  }

  public static executeReadReplicaQuery<T>(
    query: string,
    parameters?: any[],
  ): Promise<T> {
    return DatabaseService.instance.secondaryDataSource.manager.query<T>(
      query,
      parameters,
    );
  }

  static methodInterceptor(): any {
    return {
      get: (target: any, property: string) => {
        if (typeof target[property] === 'function') {
          return (...args: any[]) => {
            DatabaseService.validateWhere(property, args);
            return target[property](...args);
          };
        }
        return target[property];
      },
    };
  }

  static validateWhere(property: string, args: any[]) {
    let where: FindOptionsWhere<BaseEntity>[] | FindOptionsWhere<BaseEntity>;
    if (
      [
        'countBy',
        'findBy',
        'findAndCountBy',
        'findOneBy',
        'findOneByOrFail',
        'removeBy',
      ].includes(property)
    ) {
      where = args[0];
    } else if (
      [
        'count',
        'find',
        'findAndCount',
        'findOne',
        'findOneOrFail',
        'remove',
      ].includes(property)
    ) {
      where = args[0]?.where;
    }

    if (!where) {
      return;
    }

    if (!Array.isArray(where)) {
      where = [where];
    }

    for (const findOptionsWhere of where) {
      for (const key in findOptionsWhere) {
        if (
          findOptionsWhere[key] === undefined ||
          findOptionsWhere[key] === null
        ) {
          throw new Error(
            `Invalid where clause: ${key} cannot be undefined or null`,
          );
        }
      }
    }
  }
}

export function dbRepo<T>(entity: EntityTarget<T>): Repository<T> {
  return DatabaseService.getRepository<T>(entity);
}

export function dbReadRepo<T>(entity: EntityTarget<T>): Repository<T> {
  return DatabaseService.getReadReplicaRepository<T>(entity);
}

export function dbQuery<T>(query: string, parameters?: any[]): Promise<T> {
  return DatabaseService.executeQuery<T>(query, parameters);
}

export function dbReadQuery<T>(query: string, parameters?: any[]): Promise<T> {
  return DatabaseService.executeReadReplicaQuery<T>(query, parameters);
}
