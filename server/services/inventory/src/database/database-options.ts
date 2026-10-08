import { DataSourceOptions } from 'typeorm';
import { entities } from './entities';
import { InitialSchema1700000000000 } from './migrations/1700000000000-InitialSchema';
import { PromotionProducts1700000000001 } from './migrations/1700000000001-PromotionProducts';
import { OnlineOrders1700000000002 } from './migrations/1700000000002-OnlineOrders';
import { RenameOnlineTables1700000000003 } from './migrations/1700000000003-RenameOnlineTables';
import { AdminCredentials1700000000004 } from './migrations/1700000000004-AdminCredentials';
import { AdminCredentials } from './entities/admin-credentials.entity';

const migrations = [
  InitialSchema1700000000000,
  PromotionProducts1700000000001,
  OnlineOrders1700000000002,
  RenameOnlineTables1700000000003,
  AdminCredentials1700000000004,
];

export function databaseDataSourceOptions(): DataSourceOptions {
  return {
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER ?? 'pharmacy_app',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'pharmacy_manager',
    charset: 'utf8mb4',
    timezone: 'Z',
    entities: [...entities, AdminCredentials],
    migrations,
    migrationsRun: false,
    synchronize: false,
    logging: ['error'],
  };
}
