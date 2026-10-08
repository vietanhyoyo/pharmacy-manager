import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DashboardController } from './controllers/dashboard.controller';
import { InventoryAuthGuard } from './controllers/inventory-auth.guard';
import { IssuesController } from './controllers/issues.controller';
import { LookupsController } from './controllers/lookups.controller';
import { LotsController } from './controllers/lots.controller';
import { MovementsController } from './controllers/movements.controller';
import { ProductsController } from './controllers/products.controller';
import { ReceiptsController } from './controllers/receipts.controller';
import { StockController } from './controllers/stock.controller';
import { SuppliersController } from './controllers/suppliers.controller';
import { DashboardRepository } from './repositories/dashboard.repository';
import { InventoryRepository } from './repositories/inventory.repository';
import { IssuesRepository } from './repositories/issues.repository';
import { LookupsRepository } from './repositories/lookups.repository';
import { LotsRepository } from './repositories/lots.repository';
import { MovementsRepository } from './repositories/movements.repository';
import { ProductsRepository } from './repositories/products.repository';
import { ReceiptsRepository } from './repositories/receipts.repository';
import { StockRepository } from './repositories/stock.repository';
import { SuppliersRepository } from './repositories/suppliers.repository';
import { DashboardService } from './services/dashboard.service';
import { IssuesService } from './services/issues.service';
import { LookupsService } from './services/lookups.service';
import { LotsService } from './services/lots.service';
import { MovementsService } from './services/movements.service';
import { ProductsService } from './services/products.service';
import { ReceiptsService } from './services/receipts.service';
import { StockService } from './services/stock.service';
import { SuppliersService } from './services/suppliers.service';
import { InventoryService } from './services/inventory.service';

@Module({
  controllers: [DashboardController, LookupsController, ProductsController, SuppliersController, LotsController, StockController, ReceiptsController, IssuesController, MovementsController],
  providers: [
    DashboardRepository, IssuesRepository, InventoryRepository, LookupsRepository, LotsRepository,
    MovementsRepository, ProductsRepository, ReceiptsRepository, StockRepository, SuppliersRepository,
    DashboardService, IssuesService, InventoryService, LookupsService, LotsService, MovementsService, PrismaService,
    ProductsService, ReceiptsService, StockService, SuppliersService, InventoryAuthGuard,
  ],
  exports: [InventoryService, PrismaService],
})
export class InventoryModule {}
