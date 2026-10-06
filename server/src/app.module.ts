import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { databaseOptions } from './database/database-options';

@Module({
  imports: [TypeOrmModule.forRoot(databaseOptions())],
  controllers: [AppController],
})
export class AppModule {}

