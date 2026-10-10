import { BadRequestException, Injectable } from '@nestjs/common';
import { CheckoutRequest } from '../requests/checkout.request';
import { CatalogRepository } from '../repositories/catalog.repository';
import { OrdersRepository } from '../repositories/orders.repository';

function required(value: unknown, label: string, max: number): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new BadRequestException(`${label} không hợp lệ`);
  return value.trim();
}

@Injectable()
export class OrdersService {
  constructor(private readonly catalog: CatalogRepository, private readonly orders: OrdersRepository) {}

  async checkout(input: CheckoutRequest) {
    if (!input || typeof input !== 'object') throw new BadRequestException('Dữ liệu đơn hàng không hợp lệ');
    input.idempotencyKey = required(input.idempotencyKey, 'Mã giao dịch', 128);
    if (!/^[0-9a-f-]{36}$/i.test(input.idempotencyKey)) throw new BadRequestException('Mã giao dịch không hợp lệ');
    if (!input.customer || !input.delivery) throw new BadRequestException('Thiếu thông tin nhận hàng');
    input.customer.name = required(input.customer.name, 'Tên người nhận', 255);
    input.customer.phone = required(input.customer.phone, 'Số điện thoại', 32);
    if (!/^[+0-9() .-]{9,32}$/.test(input.customer.phone)) throw new BadRequestException('Số điện thoại không hợp lệ');
    input.delivery.address = required(input.delivery.address, 'Địa chỉ', 500);
    input.delivery.province = required(input.delivery.province, 'Tỉnh/thành', 128);
    if (input.delivery.ward) input.delivery.ward = required(input.delivery.ward, 'Phường/xã', 128);
    if (input.delivery.district) input.delivery.district = required(input.delivery.district, 'Quận/huyện', 128);
    if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 30) throw new BadRequestException('Giỏ hàng không hợp lệ');
    const seen = new Set<string>();
    for (const line of input.items) {
      if (!line || !/^[0-9a-f-]{36}$/i.test(line.productId) || !/^[0-9a-f-]{36}$/i.test(line.productUnitId) ||
          !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 20) throw new BadRequestException('Số lượng sản phẩm không hợp lệ');
      if (seen.has(line.productUnitId)) throw new BadRequestException('Sản phẩm bị trùng trong giỏ hàng');
      seen.add(line.productUnitId);
    }
    return this.orders.create(await this.catalog.organizationId(), input);
  }
}
