import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { StorefrontAppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(StorefrontAppModule);
  app.setGlobalPrefix('api/v1/storefront');
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? 3003), '0.0.0.0');
}

void bootstrap();
