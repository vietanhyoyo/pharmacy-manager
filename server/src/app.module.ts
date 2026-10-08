import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { databaseOptions } from './database/database-options';
import { AuthModule } from './auth/auth.module';
import { InventoryModule } from './inventory/inventory.module';
import { DemoSeedService } from './demo-seed.service';

@Module({
  imports: [TypeOrmModule.forRoot(databaseOptions()), AuthModule, InventoryModule],
  controllers: [AppController],
  providers: [DemoSeedService],
})
export class AppModule {}
