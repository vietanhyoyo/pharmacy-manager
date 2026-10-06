import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { entities } from './entities';
import { InitialSchema1700000000000 } from './migrations/1700000000000-InitialSchema';

export function databaseOptions(): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER ?? 'pharmacy_app',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'pharmacy_manager',
    charset: 'utf8mb4',
    timezone: 'Z',
    entities: [...entities],
    migrations: [InitialSchema1700000000000],
    migrationsRun: true,
    synchronize: false,
    logging: ['error'],
  };
}
