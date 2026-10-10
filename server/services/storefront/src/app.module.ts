import { Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { CatalogController } from './controllers/catalog.controller';
import { OrdersController } from './controllers/orders.controller';
import { HealthController } from './controllers/health.controller';
import { CatalogRepository } from './repositories/catalog.repository';
import { OrdersRepository } from './repositories/orders.repository';
import { CatalogService } from './services/catalog.service';
import { OrdersService } from './services/orders.service';
import { AdminOrdersController } from './controllers/admin-orders.controller';
import { AdminOrdersService } from './services/admin-orders.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { InventoryClientService } from './services/inventory-client.service';

@Module({
  controllers: [CatalogController, OrdersController, AdminOrdersController, HealthController],
  providers: [PrismaService, CatalogRepository, OrdersRepository, CatalogService, OrdersService, AdminOrdersService, AdminAuthGuard, InventoryClientService],
  exports: [PrismaService],
})
export class StorefrontModule {}
