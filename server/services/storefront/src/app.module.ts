import { Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { CatalogController } from './controllers/catalog.controller';
import { OrdersController } from './controllers/orders.controller';
import { HealthController } from './controllers/health.controller';
import { CatalogRepository } from './repositories/catalog.repository';
import { OrdersRepository } from './repositories/orders.repository';
import { CatalogService } from './services/catalog.service';
import { OrdersService } from './services/orders.service';

@Module({
  controllers: [CatalogController, OrdersController, HealthController],
  providers: [PrismaService, CatalogRepository, OrdersRepository, CatalogService, OrdersService],
  exports: [PrismaService],
})
export class StorefrontModule {}
