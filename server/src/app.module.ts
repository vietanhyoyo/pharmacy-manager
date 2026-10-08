import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { databaseOptions } from './database/database-options';
import { AuthRepository } from './auth/auth.repository';
import { AuthService } from './auth/auth.service';
import { AdminGuard } from './auth/admin.guard';
import { AuthController } from './auth/auth.controller';
import { InventoryRepository } from './inventory/inventory.repository';
import { InventoryService } from './inventory/inventory.service';
import { InventoryController } from './inventory/inventory.controller';
import { DemoSeedService } from './demo-seed.service';

@Module({
  imports: [TypeOrmModule.forRoot(databaseOptions())],
  controllers: [AppController, AuthController, InventoryController],
  providers: [AuthRepository, AuthService, AdminGuard, InventoryRepository, InventoryService, DemoSeedService],
})
export class AppModule {}
