import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { numeric } from './prisma-values';

@Injectable()
export class IssuesRepository {
  constructor(private readonly db: PrismaService) {}

  async issues(orgId: string) {
    const issues = await this.db.stock_adjustments.findMany({
      where: { organization_id: orgId, reason_code: { in: ['INTERNAL_USE', 'DAMAGED', 'EXPIRED', 'SAMPLE', 'OTHER'] } },
      orderBy: { adjusted_at: 'desc' },
      include: { stock_adjustment_lines: { select: { quantity_delta: true } } },
    });

    return issues.map(issue => ({
      id: issue.id,
      issueNumber: issue.adjustment_number,
      issuedAt: issue.adjusted_at,
      reasonCode: issue.reason_code,
      status: issue.status,
      lineCount: issue.stock_adjustment_lines.length,
      totalQuantity: issue.stock_adjustment_lines.reduce((total, line) => total - numeric(line.quantity_delta), 0),
    }));
  }
}
