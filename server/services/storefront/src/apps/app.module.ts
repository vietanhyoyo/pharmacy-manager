import { Module } from '@nestjs/common';
import { StorefrontModule } from '../app.module';
import { DemoCatalogSeed } from '../services/demo-catalog.seed';

@Module({ imports: [StorefrontModule], providers: [DemoCatalogSeed] })
export class StorefrontAppModule {}
