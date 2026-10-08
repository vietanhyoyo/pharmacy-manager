import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EntityManager } from 'typeorm';
import { AdminUser } from '../auth/auth.service';
import { InventoryRepository } from './inventory.repository';
import { IssueInput, LotInput, ProductInput, ReceiptInput, SupplierInput } from './inventory.types';

function required(value: unknown, label: string, max = 255): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new BadRequestException(`${label} không hợp lệ`);
  return value.trim();
}
function body(value: unknown): void {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BadRequestException('Dữ liệu gửi lên không hợp lệ');
}
function optional(value: unknown, max = 500): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.length > max) throw new BadRequestException('Trường văn bản không hợp lệ');
  return value.trim() || null;
}
function positive(value: unknown, label: string, allowZero = false): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < (allowZero ? 0 : 0.000001) || value > 1e9 || !Number.isInteger(value * 1e6)) {
    throw new BadRequestException(`${label} phải là số hợp lệ (tối đa 6 chữ số thập phân)`);
  }
  return value;
}
function date(value: unknown, label: string): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new BadRequestException(`${label} không hợp lệ`);
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new BadRequestException(`${label} không hợp lệ`);
  return value;
}
async function exists(manager: EntityManager, sql: string, params: unknown[], label: string) {
  const rows = await manager.query(sql, params);
  if (!rows.length) throw new BadRequestException(`${label} không tồn tại hoặc không thuộc hệ thống`);
  return rows[0];
}

@Injectable()
export class InventoryService {
  constructor(private readonly repo: InventoryRepository) {}

  lookups(user: AdminUser) { return this.repo.lookups(user); }
  dashboard(user: AdminUser) { return this.repo.dashboard(user); }
  products(user: AdminUser) { return this.repo.products(user.organizationId); }
  suppliers(user: AdminUser) { return this.repo.suppliers(user.organizationId); }
  lots(user: AdminUser) { return this.repo.lots(user.organizationId); }
  stock(user: AdminUser) { return this.repo.stock(user.organizationId); }
  receipts(user: AdminUser) { return this.repo.receipts(user.organizationId); }
  issues(user: AdminUser) { return this.repo.issues(user.organizationId); }
  movements(user: AdminUser) { return this.repo.movements(user.organizationId); }

  async createProduct(user: AdminUser, input: ProductInput) {
    body(input);
    const sku = required(input?.sku, 'Mã thuốc', 64).toUpperCase();
    const name = required(input?.name, 'Tên thuốc');
    const baseUnitId = required(input?.baseUnitId, 'Đơn vị', 36);
    if (input?.prescriptionType && !['RX', 'OTC', 'OTHER'].includes(input.prescriptionType)) throw new BadRequestException('Loại kê đơn không hợp lệ');
    return this.repo.db.transaction(async manager => {
      await exists(manager, 'SELECT id FROM units WHERE id=?', [baseUnitId], 'Đơn vị');
      if (input.categoryId) await exists(manager, 'SELECT id FROM categories WHERE id=? AND organization_id=?', [input.categoryId, user.organizationId], 'Nhóm thuốc');
      const id = randomUUID();
      try {
        await manager.query(`INSERT INTO products (id,organization_id,sku,name,category_id,active_ingredient,strength,dosage_form,prescription_type,base_unit_id,status)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)`, [id, user.organizationId, sku, name, input.categoryId || null, optional(input.activeIngredient), optional(input.strength, 128), optional(input.dosageForm, 128), input.prescriptionType || 'OTC', baseUnitId, 'ACTIVE']);
      } catch (error) { this.duplicate(error, 'Mã thuốc đã tồn tại'); }
      await manager.query('INSERT INTO product_units (id,product_id,unit_id,conversion_factor,is_base_unit) VALUES (?,?,?,1,1)', [randomUUID(), id, baseUnitId]);
      return { id };
    });
  }

  async updateProduct(user: AdminUser, id: string, input: ProductInput) {
    body(input);
    const sku = required(input?.sku, 'Mã thuốc', 64).toUpperCase();
    const name = required(input?.name, 'Tên thuốc');
    const status = input.status ?? 'ACTIVE';
    if (!['ACTIVE', 'INACTIVE'].includes(status)) throw new BadRequestException('Trạng thái không hợp lệ');
    if (input.prescriptionType && !['RX', 'OTC', 'OTHER'].includes(input.prescriptionType)) throw new BadRequestException('Loại kê đơn không hợp lệ');
    return this.repo.db.transaction(async manager => {
      const product = await exists(manager, 'SELECT id,base_unit_id baseUnitId FROM products WHERE id=? AND organization_id=?', [id, user.organizationId], 'Thuốc');
      if (input.baseUnitId !== product.baseUnitId) throw new BadRequestException('Không thể đổi đơn vị gốc của thuốc đã tạo');
      if (input.categoryId) await exists(manager, 'SELECT id FROM categories WHERE id=? AND organization_id=?', [input.categoryId, user.organizationId], 'Nhóm thuốc');
      try {
        await manager.query(`UPDATE products SET sku=?,name=?,category_id=?,active_ingredient=?,strength=?,dosage_form=?,prescription_type=?,status=?
          WHERE id=? AND organization_id=?`, [sku, name, input.categoryId || null, optional(input.activeIngredient), optional(input.strength, 128), optional(input.dosageForm, 128), input.prescriptionType || 'OTC', status, id, user.organizationId]);
      } catch (error) { this.duplicate(error, 'Mã thuốc đã tồn tại'); }
      return { id };
    });
  }

  async createSupplier(user: AdminUser, input: SupplierInput) {
    body(input);
    const id = randomUUID();
    try {
      await this.repo.db.query('INSERT INTO suppliers (id,organization_id,code,name,phone) VALUES (?,?,?,?,?)',
        [id, user.organizationId, required(input?.code, 'Mã nhà cung cấp', 64).toUpperCase(), required(input?.name, 'Tên nhà cung cấp'), optional(input.phone, 32)]);
    } catch (error) { this.duplicate(error, 'Mã nhà cung cấp đã tồn tại'); }
    return { id };
  }

  async updateSupplier(user: AdminUser, id: string, input: SupplierInput) {
    body(input);
    const status = input.status ?? 'ACTIVE';
    if (!['ACTIVE', 'INACTIVE'].includes(status)) throw new BadRequestException('Trạng thái không hợp lệ');
    const rows = await this.repo.db.query('SELECT id FROM suppliers WHERE id=? AND organization_id=?', [id, user.organizationId]);
    if (!rows.length) throw new NotFoundException('Nhà cung cấp không tồn tại');
    try {
      await this.repo.db.query('UPDATE suppliers SET code=?,name=?,phone=?,status=? WHERE id=? AND organization_id=?',
        [required(input?.code, 'Mã nhà cung cấp', 64).toUpperCase(), required(input?.name, 'Tên nhà cung cấp'), optional(input.phone, 32), status, id, user.organizationId]);
    } catch (error) { this.duplicate(error, 'Mã nhà cung cấp đã tồn tại'); }
    return { id };
  }

  async createLot(user: AdminUser, input: LotInput) {
    body(input);
    const productId = required(input?.productId, 'Thuốc', 36);
    const batchNumber = required(input?.batchNumber, 'Số lô', 128);
    const expiryDate = date(input?.expiryDate, 'Hạn dùng');
    const manufacturingDate = input.manufacturingDate ? date(input.manufacturingDate, 'Ngày sản xuất') : null;
    if (manufacturingDate && manufacturingDate > expiryDate) throw new BadRequestException('Hạn dùng phải sau ngày sản xuất');
    const id = randomUUID();
    await this.repo.db.transaction(async manager => {
      await exists(manager, 'SELECT id FROM products WHERE id=? AND organization_id=?', [productId, user.organizationId], 'Thuốc');
      try {
        await manager.query('INSERT INTO inventory_lots (id,organization_id,product_id,batch_number,manufacturing_date,expiry_date) VALUES (?,?,?,?,?,?)',
          [id, user.organizationId, productId, batchNumber, manufacturingDate, expiryDate]);
      } catch (error) { this.duplicate(error, 'Số lô đã tồn tại cho thuốc này'); }
    });
    return { id };
  }

  async updateLot(user: AdminUser, id: string, input: LotInput) {
    body(input);
    const status = input.status ?? 'ACTIVE';
    if (!['ACTIVE', 'BLOCKED', 'QUARANTINED', 'CLOSED'].includes(status)) throw new BadRequestException('Trạng thái lô không hợp lệ');
    const expiryDate = date(input.expiryDate, 'Hạn dùng');
    const manufacturingDate = input.manufacturingDate ? date(input.manufacturingDate, 'Ngày sản xuất') : null;
    if (manufacturingDate && manufacturingDate > expiryDate) throw new BadRequestException('Hạn dùng phải sau ngày sản xuất');
    await this.repo.db.transaction(async manager => {
      const lot = await exists(manager, 'SELECT product_id productId FROM inventory_lots WHERE id=? AND organization_id=?', [id, user.organizationId], 'Lô');
      if (lot.productId !== input.productId) throw new BadRequestException('Không thể đổi thuốc của lô');
      try {
        await manager.query('UPDATE inventory_lots SET batch_number=?,manufacturing_date=?,expiry_date=?,status=? WHERE id=? AND organization_id=?',
          [required(input.batchNumber, 'Số lô', 128), manufacturingDate, expiryDate, status, id, user.organizationId]);
      } catch (error) { this.duplicate(error, 'Số lô đã tồn tại cho thuốc này'); }
    });
    return { id };
  }

  async receive(user: AdminUser, input: ReceiptInput) {
    body(input);
    if (!Array.isArray(input?.lines) || input.lines.length < 1 || input.lines.length > 50) throw new BadRequestException('Phiếu nhập cần từ 1 đến 50 dòng');
    const context = await this.repo.context(user.organizationId);
    if (!context) throw new BadRequestException('Chưa có kho hoạt động');
    const id = randomUUID();
    const number = `NK-${Date.now()}-${id.slice(0, 6).toUpperCase()}`;
    const now = input.receivedAt ? new Date(input.receivedAt) : new Date();
    if (Number.isNaN(now.getTime())) throw new BadRequestException('Ngày nhập không hợp lệ');
    await this.repo.db.transaction(async manager => {
      await exists(manager, 'SELECT id FROM suppliers WHERE id=? AND organization_id=? AND status=?', [input.supplierId, user.organizationId, 'ACTIVE'], 'Nhà cung cấp');
      await manager.query(`INSERT INTO goods_receipts (id,organization_id,branch_id,warehouse_id,supplier_id,receipt_number,status,received_at,posted_at,created_by)
        VALUES (?,?,?,?,?,?,'POSTED',?,?,?)`, [id, user.organizationId, context.branchId, context.warehouseId, input.supplierId, number, now, new Date(), user.id]);
      for (const line of input.lines) {
        body(line);
        const quantity = positive(line.quantity, 'Số lượng');
        const purchasePrice = positive(line.purchasePrice, 'Giá nhập', true);
        const product = await exists(manager, `SELECT p.id, pu.id productUnitId FROM products p JOIN product_units pu ON pu.product_id=p.id AND pu.is_base_unit=1
          WHERE p.id=? AND p.organization_id=? AND p.status='ACTIVE'`, [line.productId, user.organizationId], 'Thuốc');
        const lot = await exists(manager, 'SELECT id,expiry_date expiryDate FROM inventory_lots WHERE id=? AND product_id=? AND organization_id=? AND status=?',
          [line.lotId, line.productId, user.organizationId, 'ACTIVE'], 'Lô');
        const expiry = lot.expiryDate instanceof Date ? lot.expiryDate.toISOString().slice(0, 10) : String(lot.expiryDate ?? '').slice(0, 10);
        if (expiry && expiry < new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())) throw new BadRequestException('Không thể nhập lô đã hết hạn');
        const lineId = randomUUID();
        await manager.query(`INSERT INTO goods_receipt_lines (id,goods_receipt_id,product_id,product_unit_id,quantity,conversion_factor,base_quantity,lot_id,purchase_price,line_total,net_cost)
          VALUES (?,?,?,?,?,1,?,?,?,?,?)`, [lineId, id, line.productId, product.productUnitId, quantity, quantity, line.lotId, purchasePrice, quantity * purchasePrice, purchasePrice]);
        await manager.query(`INSERT INTO inventory_balances (organization_id,warehouse_id,location_id,product_id,lot_id,on_hand_qty,reserved_qty,updated_at,version)
          VALUES (?,?,?,?,?,?,0,NOW(6),1) ON DUPLICATE KEY UPDATE on_hand_qty=on_hand_qty+VALUES(on_hand_qty),updated_at=NOW(6),version=version+1`,
          [user.organizationId, context.warehouseId, context.locationId, line.productId, line.lotId, quantity]);
        await this.movement(manager, user, context, line.productId, line.lotId, quantity, 'PURCHASE_RECEIPT', 'GOODS_RECEIPT', id, lineId, number, purchasePrice);
      }
    });
    return { id, receiptNumber: number };
  }

  async issue(user: AdminUser, input: IssueInput) {
    body(input);
    if (!['INTERNAL_USE', 'DAMAGED', 'EXPIRED', 'SAMPLE', 'OTHER'].includes(input?.reasonCode)) throw new BadRequestException('Lý do xuất không hợp lệ');
    if (!Array.isArray(input.lines) || input.lines.length < 1 || input.lines.length > 50) throw new BadRequestException('Phiếu xuất cần từ 1 đến 50 dòng');
    const context = await this.repo.context(user.organizationId);
    if (!context) throw new BadRequestException('Chưa có kho hoạt động');
    const id = randomUUID();
    const number = `XK-${Date.now()}-${id.slice(0, 6).toUpperCase()}`;
    await this.repo.db.transaction(async manager => {
      await manager.query(`INSERT INTO stock_adjustments (id,organization_id,branch_id,warehouse_id,adjustment_number,reason_code,status,adjusted_at,created_by,approved_by)
        VALUES (?,?,?,?,?,?,'POSTED',NOW(6),?,?)`, [id, user.organizationId, context.branchId, context.warehouseId, number, input.reasonCode, user.id, user.id]);
      for (const line of input.lines) {
        body(line);
        const quantity = positive(line.quantity, 'Số lượng');
        const lot = await exists(manager, `SELECT l.id,l.status,l.expiry_date expiryDate FROM inventory_lots l JOIN products p ON p.id=l.product_id
          WHERE l.id=? AND l.product_id=? AND l.organization_id=? AND p.status='ACTIVE'`, [line.lotId, line.productId, user.organizationId], 'Lô');
        if (!['EXPIRED', 'DAMAGED'].includes(input.reasonCode) && lot.status !== 'ACTIVE') throw new BadRequestException('Không thể xuất lô đang bị khóa');
        const expiry = lot.expiryDate instanceof Date ? lot.expiryDate.toISOString().slice(0, 10) : String(lot.expiryDate ?? '').slice(0, 10);
        if (!['EXPIRED', 'DAMAGED'].includes(input.reasonCode) && expiry && expiry < new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())) throw new BadRequestException('Lô đã hết hạn, hãy chọn lý do xuất phù hợp');
        const update = await manager.query(`UPDATE inventory_balances SET on_hand_qty=on_hand_qty-?,updated_at=NOW(6),version=version+1
          WHERE organization_id=? AND warehouse_id=? AND location_id=? AND product_id=? AND lot_id=? AND on_hand_qty-reserved_qty>=?`,
          [quantity, user.organizationId, context.warehouseId, context.locationId, line.productId, line.lotId, quantity]);
        if (update.affectedRows !== 1) throw new ConflictException('Tồn khả dụng không đủ để xuất kho');
        const lineId = randomUUID();
        await manager.query(`INSERT INTO stock_adjustment_lines (id,stock_adjustment_id,location_id,product_id,lot_id,quantity_delta,note)
          VALUES (?,?,?,?,?,?,?)`, [lineId, id, context.locationId, line.productId, line.lotId, -quantity, optional(input.note, 1000)]);
        const movementType = input.reasonCode === 'DAMAGED' ? 'DAMAGE' : input.reasonCode === 'EXPIRED' ? 'EXPIRY' : input.reasonCode === 'SAMPLE' ? 'SAMPLE' : 'INTERNAL_USE';
        await this.movement(manager, user, context, line.productId, line.lotId, -quantity, movementType, 'STOCK_ADJUSTMENT', id, lineId, number, null);
      }
    });
    return { id, issueNumber: number };
  }

  private async movement(manager: EntityManager, user: AdminUser, context: { branchId: string; warehouseId: string; locationId: string },
    productId: string, lotId: string, delta: number, type: string, sourceType: string, sourceId: string, sourceLineId: string, referenceNo: string, unitCost: number | null) {
    await manager.query(`INSERT INTO inventory_movements (id,organization_id,branch_id,warehouse_id,location_id,product_id,lot_id,movement_type,
      quantity_delta,unit_cost,source_type,source_id,source_line_id,reference_no,occurred_at,posted_at,created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(6),NOW(6),?)`, [randomUUID(), user.organizationId, context.branchId, context.warehouseId,
      context.locationId, productId, lotId, type, delta, unitCost, sourceType, sourceId, sourceLineId, referenceNo, user.id]);
  }

  private duplicate(error: unknown, message: string): never {
    const code = (error as { code?: string; driverError?: { code?: string } } | null)?.driverError?.code ?? (error as { code?: string } | null)?.code;
    if (code === 'ER_DUP_ENTRY') throw new ConflictException(message);
    throw error;
  }
}
