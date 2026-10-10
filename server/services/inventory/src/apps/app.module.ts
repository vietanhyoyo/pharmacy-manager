import { Module } from '@nestjs/common';
import { InventoryModule } from '../app.module';
import { DemoSeedService } from './seeds/demo-seed.service';

@Module({
  imports: [InventoryModule],
  providers: [DemoSeedService],
})
export class InventoryServiceAppModule {}
