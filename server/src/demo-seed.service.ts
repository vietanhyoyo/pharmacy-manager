import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { AdminUser, hashPassword } from './auth/auth.service';
import { InventoryService } from './inventory/inventory.service';

@Injectable()
export class DemoSeedService implements OnApplicationBootstrap {
  constructor(private readonly db: DataSource, private readonly inventory: InventoryService) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.SEED_DEMO_DATA === 'false') return;
    const orgId = await this.getOrCreate('SELECT id FROM organizations WHERE code=?', ['PHARMACY_DEMO'],
      'INSERT INTO organizations (id,code,name) VALUES (?,?,?)', ['PHARMACY_DEMO', 'Nhà thuốc An Tâm']);
    const branchId = await this.getOrCreate('SELECT id FROM branches WHERE organization_id=? AND code=?', [orgId, 'CN01'],
      'INSERT INTO branches (id,organization_id,code,name,address) VALUES (?,?,?,?,?)', [orgId, 'CN01', 'Chi nhánh trung tâm', '12 Nguyễn Huệ, Quận 1, TP.HCM']);
    const warehouseId = await this.getOrCreate('SELECT id FROM warehouses WHERE organization_id=? AND code=?', [orgId, 'KHO-CHINH'],
      'INSERT INTO warehouses (id,organization_id,branch_id,code,name,warehouse_type,allow_sale) VALUES (?,?,?,?,?,?,1)',
      [orgId, branchId, 'KHO-CHINH', 'Kho thuốc chính', 'SALE']);
    await this.getOrCreate('SELECT id FROM stock_locations WHERE warehouse_id=? AND code=?', [warehouseId, 'KE-A1'],
      'INSERT INTO stock_locations (id,warehouse_id,code,name) VALUES (?,?,?,?)', [warehouseId, 'KE-A1', 'Kệ A1']);
    const roleId = await this.getOrCreate('SELECT id FROM roles WHERE organization_id=? AND code=?', [orgId, 'ADMIN'],
      'INSERT INTO roles (id,organization_id,code,name) VALUES (?,?,?,?)', [orgId, 'ADMIN', 'Quản trị viên']);
    const userId = await this.getOrCreate('SELECT id FROM users WHERE organization_id=? AND username=?', [orgId, 'admin'],
      'INSERT INTO users (id,organization_id,username,full_name) VALUES (?,?,?,?)', [orgId, 'admin', 'Quản trị viên']);
    await this.getOrCreate('SELECT id FROM user_roles WHERE user_id=? AND role_id=?', [userId, roleId],
      'INSERT INTO user_roles (id,user_id,role_id) VALUES (?,?,?)', [userId, roleId]);
    const credential = await this.db.query('SELECT user_id FROM admin_credentials WHERE user_id=?', [userId]);
    if (!credential.length) await this.db.query('INSERT INTO admin_credentials (user_id,password_hash) VALUES (?,?)', [userId, await hashPassword('admin123456@')]);

    const tabletId = await this.getOrCreate('SELECT id FROM units WHERE code=?', ['VIEN'],
      'INSERT INTO units (id,code,name) VALUES (?,?,?)', ['VIEN', 'Viên']);
    await this.getOrCreate('SELECT id FROM units WHERE code=?', ['HOP'],
      'INSERT INTO units (id,code,name) VALUES (?,?,?)', ['HOP', 'Hộp']);
    const bottleId = await this.getOrCreate('SELECT id FROM units WHERE code=?', ['CHAI'],
      'INSERT INTO units (id,code,name) VALUES (?,?,?)', ['CHAI', 'Chai']);
    const categories = new Map<string, string>();
    for (const name of ['Giảm đau & hạ sốt', 'Vitamin & khoáng chất', 'Kháng sinh', 'Tiêu hóa']) {
      categories.set(name, await this.getOrCreate('SELECT id FROM categories WHERE organization_id=? AND name=?', [orgId, name],
        'INSERT INTO categories (id,organization_id,name) VALUES (?,?,?)', [orgId, name]));
    }
    const supplierA = await this.getOrCreate('SELECT id FROM suppliers WHERE organization_id=? AND code=?', [orgId, 'NCC-DUOCHAU'],
      'INSERT INTO suppliers (id,organization_id,code,name,phone) VALUES (?,?,?,?,?)', [orgId, 'NCC-DUOCHAU', 'Dược Hậu Giang', '02923891433']);
    const supplierB = await this.getOrCreate('SELECT id FROM suppliers WHERE organization_id=? AND code=?', [orgId, 'NCC-TRAPHACO'],
      'INSERT INTO suppliers (id,organization_id,code,name,phone) VALUES (?,?,?,?,?)', [orgId, 'NCC-TRAPHACO', 'Traphaco', '02436831596']);

    const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
    const meds = [
      { sku: 'PARA-500', name: 'Paracetamol 500mg', ingredient: 'Paracetamol', strength: '500mg', form: 'Viên nén', cat: 'Giảm đau & hạ sốt', unit: tabletId, batch: 'PA-2608A', expiry: day(330), qty: 240, cost: 1200, supplier: supplierA },
      { sku: 'AMOX-500', name: 'Amoxicillin 500mg', ingredient: 'Amoxicillin', strength: '500mg', form: 'Viên nang', cat: 'Kháng sinh', unit: tabletId, batch: 'AM-2607B', expiry: day(270), qty: 160, cost: 2900, supplier: supplierA },
      { sku: 'VIT-C-1000', name: 'Vitamin C 1000mg', ingredient: 'Acid ascorbic', strength: '1000mg', form: 'Viên sủi', cat: 'Vitamin & khoáng chất', unit: tabletId, batch: 'VC-2609C', expiry: day(720), qty: 90, cost: 3400, supplier: supplierB },
      { sku: 'OMEP-20', name: 'Omeprazole 20mg', ingredient: 'Omeprazole', strength: '20mg', form: 'Viên nang', cat: 'Tiêu hóa', unit: tabletId, batch: 'OM-2605D', expiry: day(45), qty: 45, cost: 2100, supplier: supplierB },
      { sku: 'SIRON-HO', name: 'Siro ho thảo dược 100ml', ingredient: 'Chiết xuất thảo dược', strength: '100ml', form: 'Siro', cat: 'Giảm đau & hạ sốt', unit: bottleId, batch: 'SH-2608E', expiry: day(450), qty: 30, cost: 28000, supplier: supplierB },
    ];
    const admin: AdminUser = { id: userId, organizationId: orgId, username: 'admin', fullName: 'Quản trị viên' };
    const seeded: { productId: string; lotId: string; qty: number; cost: number; supplier: string }[] = [];
    for (const med of meds) {
      const productId = await this.getOrCreate('SELECT id FROM products WHERE organization_id=? AND sku=?', [orgId, med.sku],
        'INSERT INTO products (id,organization_id,sku,name,category_id,active_ingredient,strength,dosage_form,prescription_type,base_unit_id) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [orgId, med.sku, med.name, categories.get(med.cat), med.ingredient, med.strength, med.form, med.sku === 'AMOX-500' ? 'RX' : 'OTC', med.unit]);
      await this.getOrCreate('SELECT id FROM product_units WHERE product_id=? AND unit_id=?', [productId, med.unit],
        'INSERT INTO product_units (id,product_id,unit_id,is_base_unit) VALUES (?,?,?,1)', [productId, med.unit]);
      const lotId = await this.getOrCreate('SELECT id FROM inventory_lots WHERE organization_id=? AND product_id=? AND batch_number=?', [orgId, productId, med.batch],
        'INSERT INTO inventory_lots (id,organization_id,product_id,batch_number,manufacturing_date,expiry_date) VALUES (?,?,?,?,?,?)',
        [orgId, productId, med.batch, day(-90), med.expiry]);
      seeded.push({ productId, lotId, qty: med.qty, cost: med.cost, supplier: med.supplier });
    }
    for (const supplierId of [supplierA, supplierB]) {
      const receiptCount = await this.db.query('SELECT COUNT(*) total FROM goods_receipts WHERE organization_id=? AND supplier_id=?', [orgId, supplierId]);
      if (Number(receiptCount[0].total) === 0) await this.inventory.receive(admin, { supplierId, lines: seeded.filter(m => m.supplier === supplierId).map(m => ({ productId: m.productId, lotId: m.lotId, quantity: m.qty, purchasePrice: m.cost })) });
    }
    const issueCount = await this.db.query('SELECT COUNT(*) total FROM stock_adjustments WHERE organization_id=?', [orgId]);
    if (Number(issueCount[0].total) === 0) await this.inventory.issue(admin, { reasonCode: 'INTERNAL_USE', note: 'Dữ liệu mẫu: sử dụng nội bộ', lines: [
      { productId: seeded[0].productId, lotId: seeded[0].lotId, quantity: 12 },
      { productId: seeded[2].productId, lotId: seeded[2].lotId, quantity: 4 },
    ] });
  }

  private async getOrCreate(select: string, selectParams: unknown[], insert: string, values: unknown[]): Promise<string> {
    const found = await this.db.query(select, selectParams);
    if (found.length) return found[0].id;
    const id = randomUUID();
    await this.db.query(insert, [id, ...values]);
    return id;
  }
}
