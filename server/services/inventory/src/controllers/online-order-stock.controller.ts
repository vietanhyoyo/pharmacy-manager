import { Controller, Headers, Param, Post, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { OnlineOrderStockService } from '../services/online-order-stock.service';

@Controller('internal/orders')
export class OnlineOrderStockController {
  constructor(private readonly stock: OnlineOrderStockService) {}

  private authenticate(secret: string | undefined) {
    const expected = process.env.INTERNAL_SERVICE_SECRET ?? '';
    if (!expected || !secret || Buffer.byteLength(secret) !== Buffer.byteLength(expected) ||
      !timingSafeEqual(Buffer.from(secret), Buffer.from(expected))) throw new UnauthorizedException('Unauthorized');
  }

  @Post(':organizationId/:orderId/reserve')
  reserve(@Headers('x-internal-service-secret') secret: string, @Param('organizationId') organizationId: string, @Param('orderId') orderId: string) {
    this.authenticate(secret);
    return this.stock.reserve(organizationId, orderId);
  }

  @Post(':organizationId/:orderId/release')
  release(@Headers('x-internal-service-secret') secret: string, @Param('organizationId') organizationId: string, @Param('orderId') orderId: string) {
    this.authenticate(secret);
    return this.stock.release(organizationId, orderId);
  }

  @Post(':organizationId/:orderId/dispatch')
  dispatch(@Headers('x-internal-service-secret') secret: string, @Param('organizationId') organizationId: string, @Param('orderId') orderId: string) {
    this.authenticate(secret);
    return this.stock.dispatch(organizationId, orderId);
  }
}
