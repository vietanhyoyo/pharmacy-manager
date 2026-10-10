import { BadRequestException, ConflictException, Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class InventoryClientService {
  async orderAction(organizationId: string, orderId: string, action: 'reserve' | 'release' | 'dispatch') {
    const base = (process.env.INVENTORY_SERVICE_URL ?? 'http://localhost:3002').replace(/\/$/, '');
    try {
      const response = await fetch(`${base}/api/v1/inventory/internal/orders/${organizationId}/${orderId}/${action}`, {
        method: 'POST', headers: { 'x-internal-service-secret': process.env.INTERNAL_SERVICE_SECRET ?? '' }, signal: AbortSignal.timeout(15_000),
      });
      if (response.ok) return;
      const payload = await response.json().catch(() => ({})) as { message?: string };
      if (response.status === 400) throw new BadRequestException(payload.message ?? 'Không đủ tồn kho');
      if (response.status === 409) throw new ConflictException(payload.message ?? 'Tồn kho vừa thay đổi');
      throw new ServiceUnavailableException('Không thể xử lý tồn kho');
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException || error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException('Không thể kết nối service kho');
    }
  }
}
