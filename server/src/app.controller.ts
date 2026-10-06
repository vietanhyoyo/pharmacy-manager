import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('health')
  async health(): Promise<{ status: string; database: string }> {
    await this.dataSource.query('SELECT 1');
    return { status: 'ok', database: 'connected' };
  }
}

