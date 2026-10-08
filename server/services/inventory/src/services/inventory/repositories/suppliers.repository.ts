import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class SuppliersRepository {
  constructor(private readonly db: PrismaService) {}

  suppliers(orgId: string) {
    return this.db.suppliers.findMany({
      where: { organization_id: orgId },
      select: { id: true, code: true, name: true, phone: true, status: true },
      orderBy: { created_at: 'desc' },
    });
  }
}
