import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller('internal')
export class InternalHealthController {
  constructor(private readonly db: PrismaService) {}

  @Get('health')
  async health() {
    await this.db.units.count();
    return { status: 'ok', service: 'inventory' };
  }
}
