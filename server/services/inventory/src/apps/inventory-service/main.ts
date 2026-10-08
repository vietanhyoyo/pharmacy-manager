import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { InventoryServiceAppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(InventoryServiceAppModule);
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? 3002), '0.0.0.0');
}

void bootstrap();
