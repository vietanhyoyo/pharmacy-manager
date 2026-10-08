import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DashboardController } from './controllers/dashboard.controller';
import { IssuesController } from './controllers/issues.controller';
import { LotsController } from './controllers/lots.controller';
import { ProductsController } from './controllers/products.controller';
import { ReceiptsController } from './controllers/receipts.controller';
import { SuppliersController } from './controllers/suppliers.controller';
import { InventoryRepository } from './repositories/inventory.repository';
import { InventoryService } from './services/inventory.service';

@Module({
  imports: [AuthModule],
  controllers: [
    DashboardController,
    ProductsController,
    SuppliersController,
    LotsController,
    ReceiptsController,
    IssuesController,
  ],
  providers: [InventoryRepository, InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
