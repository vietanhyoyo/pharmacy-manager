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

  createSupplier(orgId: string, input: { id: string; code: string; name: string; phone: string | null }) {
    return this.db.suppliers.create({ data: {
      id: input.id, organization_id: orgId, code: input.code, name: input.name, phone: input.phone,
    } });
  }

  async updateSupplier(orgId: string, id: string, input: { code: string; name: string; phone: string | null; status: string }) {
    return this.db.suppliers.updateMany({
      where: { id, organization_id: orgId },
      data: { code: input.code, name: input.name, phone: input.phone, status: input.status },
    });
  }
}
