import { primaryDataSource } from './src/config/database/primaryDataSource';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config();

// Create and initialize the primaryDataSource asynchronously
const dataSource = async (): Promise<DataSource> => {
  const primaryDataSourceInstance = await primaryDataSource();

  return new DataSource({
    ...primaryDataSourceInstance.options,
    logging: false,
  });
};

// Since TypeORM expects a synchronous export, we need to call the async function
export default dataSource().then((ds) => ds);
