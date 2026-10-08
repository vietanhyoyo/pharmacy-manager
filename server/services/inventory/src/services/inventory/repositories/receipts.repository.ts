import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { numeric } from './prisma-values';

@Injectable()
export class ReceiptsRepository {
  constructor(private readonly db: PrismaService) {}

  async receipts(orgId: string) {
    const receipts = await this.db.goods_receipts.findMany({
      where: { organization_id: orgId },
      orderBy: { received_at: 'desc' },
      include: {
        suppliers: { select: { name: true } },
        goods_receipt_lines: { select: { base_quantity: true, line_total: true } },
      },
    });

    return receipts.map(receipt => ({
      id: receipt.id,
      receiptNumber: receipt.receipt_number,
      receivedAt: receipt.received_at,
      status: receipt.status,
      supplierName: receipt.suppliers.name,
      lineCount: receipt.goods_receipt_lines.length,
      totalQuantity: receipt.goods_receipt_lines.reduce((total, line) => total + numeric(line.base_quantity), 0),
      totalAmount: receipt.goods_receipt_lines.reduce((total, line) => total + numeric(line.line_total), 0),
    }));
  }
}
