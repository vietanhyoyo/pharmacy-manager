import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { databaseDataSourceOptions } from './database-options';

async function migrate(): Promise<void> {
  const dataSource = new DataSource(databaseDataSourceOptions());
  try {
    await dataSource.initialize();
    const applied = await dataSource.runMigrations();
    console.info(`Database migrations complete (${applied.length} applied).`);
  } catch (error) {
    console.error('Database migration failed.', error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) await dataSource.destroy();
  }
}

void migrate();
