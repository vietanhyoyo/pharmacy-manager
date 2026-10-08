import { Module } from '@nestjs/common';
import { InventoryModule } from '../../services/inventory/inventory.module';
import { DemoSeedService } from './seeds/demo-seed.service';
import { InternalHealthController } from './health.controller';

@Module({
  imports: [InventoryModule],
  controllers: [InternalHealthController],
  providers: [DemoSeedService],
})
export class InventoryServiceAppModule {}
