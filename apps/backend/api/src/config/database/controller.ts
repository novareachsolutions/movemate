import { DataSource } from 'typeorm';
import { primaryDataSource } from './primaryDataSource';
import { readReplicaDataSource } from './readReplicaDataSource';
import { logger } from 'src/logger';

export class DatabaseController {
  private static instance: DatabaseController = null;

  private primaryDataSource: DataSource;
  private secondaryDataSource: DataSource;

  public static async initialize() {
    if (DatabaseController.instance === null) {
      DatabaseController.instance = new DatabaseController();
      await DatabaseController.instance.connect();
    }
  }

  public static async stop(): Promise<void> {
    if (DatabaseController.instance) {
      await DatabaseController.instance.close();
      DatabaseController.instance = null;
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
}
