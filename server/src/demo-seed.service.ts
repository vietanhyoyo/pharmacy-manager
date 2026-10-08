import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { AdminUser, hashPassword } from './auth/auth.service';
import { InventoryService } from './inventory/services/inventory.service';

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
    const boxId = await this.getOrCreate('SELECT id FROM units WHERE code=?', ['HOP'],
      'INSERT INTO units (id,code,name) VALUES (?,?,?)', ['HOP', 'Hộp']);
    const bottleId = await this.getOrCreate('SELECT id FROM units WHERE code=?', ['CHAI'],
      'INSERT INTO units (id,code,name) VALUES (?,?,?)', ['CHAI', 'Chai']);
    const sachetId = await this.getOrCreate('SELECT id FROM units WHERE code=?', ['GOI'],
      'INSERT INTO units (id,code,name) VALUES (?,?,?)', ['GOI', 'Gói']);
    const tubeId = await this.getOrCreate('SELECT id FROM units WHERE code=?', ['TUYP'],
      'INSERT INTO units (id,code,name) VALUES (?,?,?)', ['TUYP', 'Tuýp']);
    const categories = new Map<string, string>();
    for (const name of [
      'Giảm đau & hạ sốt', 'Vitamin & khoáng chất', 'Kháng sinh', 'Tiêu hóa',
      'Tim mạch', 'Dị ứng', 'Hô hấp', 'Da liễu', 'Mắt & tai', 'Sát khuẩn',
    ]) {
      categories.set(name, await this.getOrCreate('SELECT id FROM categories WHERE organization_id=? AND name=?', [orgId, name],
        'INSERT INTO categories (id,organization_id,name) VALUES (?,?,?)', [orgId, name]));
    }
    const supplierA = await this.getOrCreate('SELECT id FROM suppliers WHERE organization_id=? AND code=?', [orgId, 'NCC-DUOCHAU'],
      'INSERT INTO suppliers (id,organization_id,code,name,phone) VALUES (?,?,?,?,?)', [orgId, 'NCC-DUOCHAU', 'Dược Hậu Giang', '02923891433']);
    const supplierB = await this.getOrCreate('SELECT id FROM suppliers WHERE organization_id=? AND code=?', [orgId, 'NCC-TRAPHACO'],
      'INSERT INTO suppliers (id,organization_id,code,name,phone) VALUES (?,?,?,?,?)', [orgId, 'NCC-TRAPHACO', 'Traphaco', '02436831596']);

    const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
    const additionalMeds = [
      { sku: 'IBU-200', name: 'Ibuprofen 200mg', ingredient: 'Ibuprofen', strength: '200mg', form: 'Viên nén', cat: 'Giảm đau & hạ sốt', unitCode: 'VIEN', prescriptionType: 'OTC' },
      { sku: 'ASP-81', name: 'Aspirin 81mg', ingredient: 'Acid acetylsalicylic', strength: '81mg', form: 'Viên bao phim', cat: 'Tim mạch', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'DICLO-50', name: 'Diclofenac 50mg', ingredient: 'Diclofenac', strength: '50mg', form: 'Viên bao tan trong ruột', cat: 'Giảm đau & hạ sốt', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'NAPROX-250', name: 'Naproxen 250mg', ingredient: 'Naproxen', strength: '250mg', form: 'Viên nén', cat: 'Giảm đau & hạ sốt', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'CELE-200', name: 'Celecoxib 200mg', ingredient: 'Celecoxib', strength: '200mg', form: 'Viên nang', cat: 'Giảm đau & hạ sốt', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'MET-500', name: 'Metformin 500mg', ingredient: 'Metformin', strength: '500mg', form: 'Viên nén', cat: 'Tim mạch', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'AMLO-5', name: 'Amlodipine 5mg', ingredient: 'Amlodipine', strength: '5mg', form: 'Viên nén', cat: 'Tim mạch', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'LOSA-50', name: 'Losartan 50mg', ingredient: 'Losartan', strength: '50mg', form: 'Viên nén', cat: 'Tim mạch', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'ATOR-10', name: 'Atorvastatin 10mg', ingredient: 'Atorvastatin', strength: '10mg', form: 'Viên nén', cat: 'Tim mạch', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'BISO-25', name: 'Bisoprolol 2.5mg', ingredient: 'Bisoprolol', strength: '2.5mg', form: 'Viên nén', cat: 'Tim mạch', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'PANTO-40', name: 'Pantoprazole 40mg', ingredient: 'Pantoprazole', strength: '40mg', form: 'Viên bao tan trong ruột', cat: 'Tiêu hóa', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'ESOME-40', name: 'Esomeprazole 40mg', ingredient: 'Esomeprazole', strength: '40mg', form: 'Viên nang', cat: 'Tiêu hóa', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'DOM-10', name: 'Domperidone 10mg', ingredient: 'Domperidone', strength: '10mg', form: 'Viên nén', cat: 'Tiêu hóa', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'DIOS-3G', name: 'Diosmectite 3g', ingredient: 'Diosmectite', strength: '3g', form: 'Bột pha hỗn dịch', cat: 'Tiêu hóa', unitCode: 'GOI', prescriptionType: 'OTC' },
      { sku: 'PROBIO-2ML', name: 'Men vi sinh 2ml', ingredient: 'Bacillus clausii', strength: '2ml', form: 'Hỗn dịch uống', cat: 'Tiêu hóa', unitCode: 'CHAI', prescriptionType: 'OTC' },
      { sku: 'LOPE-2', name: 'Loperamide 2mg', ingredient: 'Loperamide', strength: '2mg', form: 'Viên nang', cat: 'Tiêu hóa', unitCode: 'VIEN', prescriptionType: 'OTC' },
      { sku: 'ORS-245', name: 'Dung dịch bù nước điện giải 245ml', ingredient: 'Natri clorid, kali clorid', strength: '245ml', form: 'Dung dịch uống', cat: 'Tiêu hóa', unitCode: 'CHAI', prescriptionType: 'OTC' },
      { sku: 'CETI-10', name: 'Cetirizine 10mg', ingredient: 'Cetirizine', strength: '10mg', form: 'Viên nén', cat: 'Dị ứng', unitCode: 'VIEN', prescriptionType: 'OTC' },
      { sku: 'LORA-10', name: 'Loratadine 10mg', ingredient: 'Loratadine', strength: '10mg', form: 'Viên nén', cat: 'Dị ứng', unitCode: 'VIEN', prescriptionType: 'OTC' },
      { sku: 'FEXO-180', name: 'Fexofenadine 180mg', ingredient: 'Fexofenadine', strength: '180mg', form: 'Viên nén', cat: 'Dị ứng', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'CHLOR-4', name: 'Chlorpheniramine 4mg', ingredient: 'Chlorpheniramine', strength: '4mg', form: 'Viên nén', cat: 'Dị ứng', unitCode: 'VIEN', prescriptionType: 'OTC' },
      { sku: 'DEXTRO-15', name: 'Dextromethorphan 15mg', ingredient: 'Dextromethorphan', strength: '15mg', form: 'Viên nén', cat: 'Hô hấp', unitCode: 'VIEN', prescriptionType: 'OTC' },
      { sku: 'ACETYL-200', name: 'Acetylcysteine 200mg', ingredient: 'Acetylcysteine', strength: '200mg', form: 'Bột pha uống', cat: 'Hô hấp', unitCode: 'GOI', prescriptionType: 'OTC' },
      { sku: 'AMBRO-30', name: 'Ambroxol 30mg', ingredient: 'Ambroxol', strength: '30mg', form: 'Viên nén', cat: 'Hô hấp', unitCode: 'VIEN', prescriptionType: 'OTC' },
      { sku: 'SALBU-2', name: 'Salbutamol 2mg', ingredient: 'Salbutamol', strength: '2mg', form: 'Viên nén', cat: 'Hô hấp', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'PRED-5', name: 'Prednisolone 5mg', ingredient: 'Prednisolone', strength: '5mg', form: 'Viên nén', cat: 'Hô hấp', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'AZI-250', name: 'Azithromycin 250mg', ingredient: 'Azithromycin', strength: '250mg', form: 'Viên nang', cat: 'Kháng sinh', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'CEPHA-500', name: 'Cephalexin 500mg', ingredient: 'Cephalexin', strength: '500mg', form: 'Viên nang', cat: 'Kháng sinh', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'CEFU-250', name: 'Cefuroxime 250mg', ingredient: 'Cefuroxime', strength: '250mg', form: 'Viên nén', cat: 'Kháng sinh', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'CIPRO-500', name: 'Ciprofloxacin 500mg', ingredient: 'Ciprofloxacin', strength: '500mg', form: 'Viên nén', cat: 'Kháng sinh', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'DOXY-100', name: 'Doxycycline 100mg', ingredient: 'Doxycycline', strength: '100mg', form: 'Viên nang', cat: 'Kháng sinh', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'METRO-250', name: 'Metronidazole 250mg', ingredient: 'Metronidazole', strength: '250mg', form: 'Viên nén', cat: 'Kháng sinh', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'AMCLAV-625', name: 'Amoxicillin/Clavulanate 625mg', ingredient: 'Amoxicillin, acid clavulanic', strength: '625mg', form: 'Viên nén', cat: 'Kháng sinh', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'LEVO-500', name: 'Levofloxacin 500mg', ingredient: 'Levofloxacin', strength: '500mg', form: 'Viên nén', cat: 'Kháng sinh', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'COTRI-480', name: 'Co-trimoxazole 480mg', ingredient: 'Sulfamethoxazole, trimethoprim', strength: '480mg', form: 'Viên nén', cat: 'Kháng sinh', unitCode: 'VIEN', prescriptionType: 'RX' },
      { sku: 'MULTI-VIT', name: 'Vitamin tổng hợp', ingredient: 'Vitamin tổng hợp', strength: '—', form: 'Viên nén', cat: 'Vitamin & khoáng chất', unitCode: 'VIEN', prescriptionType: 'OTC' },
      { sku: 'CAL-D3', name: 'Calci + Vitamin D3', ingredient: 'Calci, cholecalciferol', strength: '500mg + 200IU', form: 'Viên nén', cat: 'Vitamin & khoáng chất', unitCode: 'VIEN', prescriptionType: 'OTC' },
      { sku: 'ZINC-20', name: 'Kẽm 20mg', ingredient: 'Kẽm gluconat', strength: '20mg', form: 'Viên nén', cat: 'Vitamin & khoáng chất', unitCode: 'VIEN', prescriptionType: 'OTC' },
      { sku: 'B-COMPLEX', name: 'Vitamin B tổng hợp', ingredient: 'Vitamin B1, B6, B12', strength: '—', form: 'Viên nén', cat: 'Vitamin & khoáng chất', unitCode: 'VIEN', prescriptionType: 'OTC' },
      { sku: 'OMEGA3-1000', name: 'Omega-3 1000mg', ingredient: 'Dầu cá omega-3', strength: '1000mg', form: 'Viên nang mềm', cat: 'Vitamin & khoáng chất', unitCode: 'VIEN', prescriptionType: 'OTC' },
      { sku: 'FERRO-200', name: 'Sắt 200mg', ingredient: 'Sắt sulfat', strength: '200mg', form: 'Viên nén', cat: 'Vitamin & khoáng chất', unitCode: 'VIEN', prescriptionType: 'OTC' },
      { sku: 'FOLIC-5', name: 'Acid folic 5mg', ingredient: 'Acid folic', strength: '5mg', form: 'Viên nén', cat: 'Vitamin & khoáng chất', unitCode: 'VIEN', prescriptionType: 'OTC' },
      { sku: 'D3-1000', name: 'Vitamin D3 1000IU', ingredient: 'Cholecalciferol', strength: '1000IU', form: 'Viên nang mềm', cat: 'Vitamin & khoáng chất', unitCode: 'VIEN', prescriptionType: 'OTC' },
      { sku: 'POVI-10', name: 'Dung dịch povidone iodine 10%', ingredient: 'Povidone iodine', strength: '10%', form: 'Dung dịch sát khuẩn', cat: 'Sát khuẩn', unitCode: 'CHAI', prescriptionType: 'OTC' },
      { sku: 'CHLORHEX-005', name: 'Dung dịch chlorhexidine 0.05%', ingredient: 'Chlorhexidine', strength: '0.05%', form: 'Dung dịch sát khuẩn', cat: 'Sát khuẩn', unitCode: 'CHAI', prescriptionType: 'OTC' },
      { sku: 'HYDRO-1', name: 'Hydrocortisone 1%', ingredient: 'Hydrocortisone', strength: '1%', form: 'Kem bôi', cat: 'Da liễu', unitCode: 'TUYP', prescriptionType: 'OTC' },
      { sku: 'CLOTRI-1', name: 'Clotrimazole 1%', ingredient: 'Clotrimazole', strength: '1%', form: 'Kem bôi', cat: 'Da liễu', unitCode: 'TUYP', prescriptionType: 'OTC' },
      { sku: 'MUPIRO-2', name: 'Mupirocin 2%', ingredient: 'Mupirocin', strength: '2%', form: 'Thuốc mỡ', cat: 'Da liễu', unitCode: 'TUYP', prescriptionType: 'RX' },
      { sku: 'DICLO-GEL-1', name: 'Diclofenac gel 1%', ingredient: 'Diclofenac', strength: '1%', form: 'Gel bôi ngoài da', cat: 'Da liễu', unitCode: 'TUYP', prescriptionType: 'OTC' },
      { sku: 'TEARS-05', name: 'Nước mắt nhân tạo 0.5%', ingredient: 'Carboxymethylcellulose', strength: '0.5%', form: 'Dung dịch nhỏ mắt', cat: 'Mắt & tai', unitCode: 'CHAI', prescriptionType: 'OTC' },
      { sku: 'CHLORA-EYE', name: 'Chloramphenicol 0.5%', ingredient: 'Chloramphenicol', strength: '0.5%', form: 'Dung dịch nhỏ mắt', cat: 'Mắt & tai', unitCode: 'CHAI', prescriptionType: 'RX' },
      { sku: 'OFLO-EAR', name: 'Ofloxacin 0.3%', ingredient: 'Ofloxacin', strength: '0.3%', form: 'Dung dịch nhỏ tai', cat: 'Mắt & tai', unitCode: 'CHAI', prescriptionType: 'RX' },
      { sku: 'PARA-SYR-120', name: 'Paracetamol siro 120mg/5ml', ingredient: 'Paracetamol', strength: '120mg/5ml', form: 'Siro uống', cat: 'Giảm đau & hạ sốt', unitCode: 'CHAI', prescriptionType: 'OTC' },
      { sku: 'CETI-SYR-1', name: 'Cetirizine siro 1mg/ml', ingredient: 'Cetirizine', strength: '1mg/ml', form: 'Siro uống', cat: 'Dị ứng', unitCode: 'CHAI', prescriptionType: 'OTC' },
      { sku: 'ORS-GOI', name: 'Oresol gói pha uống', ingredient: 'Natri clorid, kali clorid', strength: '27.9g', form: 'Bột pha dung dịch uống', cat: 'Tiêu hóa', unitCode: 'GOI', prescriptionType: 'OTC' },
    ];
    const unitIds: Record<string, string> = { VIEN: tabletId, HOP: boxId, CHAI: bottleId, GOI: sachetId, TUYP: tubeId };
    const meds = [
      { sku: 'PARA-500', name: 'Paracetamol 500mg', ingredient: 'Paracetamol', strength: '500mg', form: 'Viên nén', cat: 'Giảm đau & hạ sốt', unit: tabletId, batch: 'PA-2608A', expiry: day(330), qty: 240, cost: 1200, supplier: supplierA, prescriptionType: 'OTC' },
      { sku: 'AMOX-500', name: 'Amoxicillin 500mg', ingredient: 'Amoxicillin', strength: '500mg', form: 'Viên nang', cat: 'Kháng sinh', unit: tabletId, batch: 'AM-2607B', expiry: day(270), qty: 160, cost: 2900, supplier: supplierA, prescriptionType: 'RX' },
      { sku: 'VIT-C-1000', name: 'Vitamin C 1000mg', ingredient: 'Acid ascorbic', strength: '1000mg', form: 'Viên sủi', cat: 'Vitamin & khoáng chất', unit: tabletId, batch: 'VC-2609C', expiry: day(720), qty: 90, cost: 3400, supplier: supplierB, prescriptionType: 'OTC' },
      { sku: 'OMEP-20', name: 'Omeprazole 20mg', ingredient: 'Omeprazole', strength: '20mg', form: 'Viên nang', cat: 'Tiêu hóa', unit: tabletId, batch: 'OM-2605D', expiry: day(45), qty: 45, cost: 2100, supplier: supplierB, prescriptionType: 'OTC' },
      { sku: 'SIRON-HO', name: 'Siro ho thảo dược 100ml', ingredient: 'Chiết xuất thảo dược', strength: '100ml', form: 'Siro', cat: 'Hô hấp', unit: bottleId, batch: 'SH-2608E', expiry: day(450), qty: 30, cost: 28000, supplier: supplierB, prescriptionType: 'OTC' },
      ...additionalMeds.map((med, index) => ({
        sku: med.sku,
        name: med.name,
        ingredient: med.ingredient,
        strength: med.strength,
        form: med.form,
        cat: med.cat,
        unit: unitIds[med.unitCode],
        batch: `${med.sku}-2601`,
        expiry: day(240 + ((index * 53) % 720)),
        qty: 40 + ((index * 37) % 260),
        cost: 1000 + ((index * 1901) % 48000),
        supplier: index % 2 === 0 ? supplierA : supplierB,
        prescriptionType: med.prescriptionType,
      })),
    ];
    const admin: AdminUser = { id: userId, organizationId: orgId, username: 'admin', fullName: 'Quản trị viên' };
    const seeded: { productId: string; lotId: string; qty: number; cost: number; supplier: string }[] = [];
    for (const med of meds) {
      const productId = await this.getOrCreate('SELECT id FROM products WHERE organization_id=? AND sku=?', [orgId, med.sku],
        'INSERT INTO products (id,organization_id,sku,name,category_id,active_ingredient,strength,dosage_form,prescription_type,base_unit_id) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [orgId, med.sku, med.name, categories.get(med.cat), med.ingredient, med.strength, med.form, med.prescriptionType, med.unit]);
      await this.getOrCreate('SELECT id FROM product_units WHERE product_id=? AND unit_id=?', [productId, med.unit],
        'INSERT INTO product_units (id,product_id,unit_id,is_base_unit) VALUES (?,?,?,1)', [productId, med.unit]);
      const lotId = await this.getOrCreate('SELECT id FROM inventory_lots WHERE organization_id=? AND product_id=? AND batch_number=?', [orgId, productId, med.batch],
        'INSERT INTO inventory_lots (id,organization_id,product_id,batch_number,manufacturing_date,expiry_date) VALUES (?,?,?,?,?,?)',
        [orgId, productId, med.batch, day(-90), med.expiry]);
      const balance = await this.db.query('SELECT 1 FROM inventory_balances WHERE organization_id=? AND lot_id=? LIMIT 1', [orgId, lotId]);
      if (!balance.length) seeded.push({ productId, lotId, qty: med.qty, cost: med.cost, supplier: med.supplier });
    }
    for (const supplierId of [supplierA, supplierB]) {
      const lines = seeded.filter(m => m.supplier === supplierId).map(m => ({ productId: m.productId, lotId: m.lotId, quantity: m.qty, purchasePrice: m.cost }));
      if (lines.length) await this.inventory.receive(admin, { supplierId, lines });
    }
    const issueCount = await this.db.query('SELECT COUNT(*) total FROM stock_adjustments WHERE organization_id=?', [orgId]);
    if (Number(issueCount[0].total) === 0 && seeded.length >= 3) await this.inventory.issue(admin, { reasonCode: 'INTERNAL_USE', note: 'Dữ liệu mẫu: sử dụng nội bộ', lines: [
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
