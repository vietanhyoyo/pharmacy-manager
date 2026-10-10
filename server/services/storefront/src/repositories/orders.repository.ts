import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { CheckoutRequest } from '../requests/checkout.request';
import { activePrice } from '../services/catalog.service';

@Injectable()
export class OrdersRepository {
  constructor(private readonly db: PrismaService) {}

  async track(organizationId: string, orderNumber: string, phone: string) {
    const order = await this.db.orders.findFirst({ where: { organization_id: organizationId, order_number: orderNumber, recipient_phone: phone },
      select: { order_number: true, status: true, payment_status: true, placed_at: true, total_amount: true, branches: { select: { name: true } } } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng với mã và số điện thoại này');
    return { orderNumber: order.order_number, status: order.status, paymentStatus: order.payment_status, placedAt: order.placed_at,
      total: Number(order.total_amount), branchName: order.branches.name };
  }

  async create(organizationId: string, input: CheckoutRequest) {
    try {
      return await this.db.$transaction(async tx => {
        const previous = await tx.orders.findUnique({
          where: { organization_id_idempotency_key: { organization_id: organizationId, idempotency_key: input.idempotencyKey } },
          select: { id: true, order_number: true, status: true, total_amount: true, branch_id: true },
        });
        if (previous) {
          if (previous.branch_id !== input.branchId) throw new BadRequestException('Mã giao dịch đã dùng cho chi nhánh khác');
          return { id: previous.id, orderNumber: previous.order_number, status: previous.status, total: Number(previous.total_amount) };
        }

        const branch = await tx.branches.findFirst({ where: { id: input.branchId, organization_id: organizationId, status: 'ACTIVE', warehouses: { some: { status: 'ACTIVE', allow_sale: true } } }, select: { id: true, warehouses: { where: { status: 'ACTIVE', allow_sale: true }, orderBy: { created_at: 'asc' }, select: { id: true }, take: 1 } } });
        if (!branch?.warehouses[0]) throw new ServiceUnavailableException('Chưa có chi nhánh nhận đơn hàng');

        const orderLines = [];
        for (const line of input.items) {
          const product = await tx.products.findFirst({
            where: { id: line.productId, organization_id: organizationId, status: 'ACTIVE', prescription_type: 'OTC', product_listings: { status: 'PUBLISHED' } },
            include: { product_listings: true, product_units: { include: { units: true } }, price_list_items: { include: { price_lists: true }, orderBy: { effective_from: 'desc' } } },
          });
          const unit = product?.product_units.find(value => value.id === line.productUnitId && value.allow_sale);
          if (!product || !unit) throw new BadRequestException('Một sản phẩm không còn được bán');
          const price = activePrice(product, unit.id);
          if (price === null || price <= 0) throw new BadRequestException(`Sản phẩm ${product.name} chưa có giá bán hợp lệ`);
          const baseQuantity = line.quantity * Number(unit.conversion_factor);
          const today = new Date(); today.setUTCHours(0, 0, 0, 0);
          const balances = await tx.inventory_balances.findMany({
            where: { organization_id: organizationId, product_id: product.id, warehouse_id: branch.warehouses[0].id,
              stock_locations: { status: 'ACTIVE' }, inventory_lots: { status: 'ACTIVE', OR: [{ expiry_date: null }, { expiry_date: { gte: today } }] } },
            select: { on_hand_qty: true, reserved_qty: true },
          });
          const available = balances.reduce((sum, balance) => sum + Math.max(0, Number(balance.on_hand_qty) - Number(balance.reserved_qty)), 0);
          if (available < baseQuantity) throw new BadRequestException(`Sản phẩm ${product.name} không đủ tồn kho`);
          orderLines.push({ product, unit, quantity: line.quantity, baseQuantity, price });
        }

        const customerId = randomUUID();
        await tx.customers.create({ data: { id: customerId, organization_id: organizationId, name: input.customer.name, phone: input.customer.phone } });
        const id = randomUUID();
        const orderNumber = `WEB-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${id.slice(0, 8).toUpperCase()}`;
        const subtotal = orderLines.reduce((sum, line) => sum + line.price * line.quantity, 0);
        await tx.orders.create({ data: {
          id, organization_id: organizationId, customer_id: customerId, branch_id: branch.id,
          warehouse_id: branch.warehouses[0].id, order_number: orderNumber,
          idempotency_key: input.idempotencyKey, status: 'PLACED', payment_status: 'UNPAID',
          review_status: 'NOT_REQUIRED', fulfillment_method: 'DELIVERY', currency: 'VND',
          subtotal, discount_amount: 0, tax_amount: 0, shipping_fee: 0, total_amount: subtotal,
          recipient_name: input.customer.name, recipient_phone: input.customer.phone,
          shipping_address_line1: input.delivery.address, shipping_ward: input.delivery.ward || null,
          shipping_district: input.delivery.district || null, shipping_province: input.delivery.province,
          shipping_country_code: 'VN', placed_at: new Date(),
        } });
        for (const line of orderLines) {
          await tx.order_lines.create({ data: {
            id: randomUUID(), organization_id: organizationId, order_id: id,
            product_id: line.product.id, product_unit_id: line.unit.id,
            product_sku_snapshot: line.product.sku, product_name_snapshot: line.product.name,
            unit_code_snapshot: line.unit.units.code, quantity: line.quantity,
            conversion_factor: line.unit.conversion_factor, base_quantity: line.baseQuantity,
            unit_price: line.price, vat_rate: 0, discount_amount: 0, tax_amount: 0,
            line_total: line.price * line.quantity, prescription_required: false,
          } });
        }
        await tx.order_events.create({ data: { id: randomUUID(), organization_id: organizationId, order_id: id, to_status: 'PLACED', actor_type: 'SYSTEM' } });
        return { id, orderNumber, status: 'PLACED', total: subtotal };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 15000 });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ServiceUnavailableException) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new BadRequestException('Đơn hàng đang được xử lý, vui lòng kiểm tra lại');
      throw error;
    }
  }
}
