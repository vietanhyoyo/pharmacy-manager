import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

function databaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const username = encodeURIComponent(process.env.DB_USER ?? 'pharmacy_app');
  const password = encodeURIComponent(process.env.DB_PASSWORD ?? '');
  const host = process.env.DB_HOST ?? 'localhost';
  const port = Number(process.env.DB_PORT ?? 3306);
  const database = encodeURIComponent(process.env.DB_NAME ?? 'pharmacy_manager');
  return `mysql://${username}:${password}@${host}:${port}/${database}`;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ datasources: { db: { url: databaseUrl() } } });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
