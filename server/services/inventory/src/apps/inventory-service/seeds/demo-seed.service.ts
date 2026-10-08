import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../database/prisma.service';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { InventoryService } from '../../../services/inventory/services/inventory.service';

@Injectable()
export class DemoSeedService implements OnApplicationBootstrap {
  constructor(private readonly db: PrismaService, private readonly inventory: InventoryService) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.SEED_DEMO_DATA === 'false') return;
    const orgId = await this.getOrCreate(
      () => this.db.organizations.findUnique({ where: { code: 'PHARMACY_DEMO' }, select: { id: true } }),
      id => this.db.organizations.create({ data: { id, code: 'PHARMACY_DEMO', name: 'Nhà thuốc An Tâm' }, select: { id: true } }),
    );
    const branchId = await this.getOrCreate(
      () => this.db.branches.findFirst({ where: { organization_id: orgId, code: 'CN01' }, select: { id: true } }),
      id => this.db.branches.create({ data: { id, organization_id: orgId, code: 'CN01', name: 'Chi nhánh trung tâm', address: '12 Nguyễn Huệ, Quận 1, TP.HCM' }, select: { id: true } }),
    );
    const warehouseId = await this.getOrCreate(
      () => this.db.warehouses.findFirst({ where: { organization_id: orgId, code: 'KHO-CHINH' }, select: { id: true } }),
      id => this.db.warehouses.create({ data: { id, organization_id: orgId, branch_id: branchId, code: 'KHO-CHINH', name: 'Kho thuốc chính', warehouse_type: 'SALE', allow_sale: true }, select: { id: true } }),
    );
    await this.getOrCreate(
      () => this.db.stock_locations.findFirst({ where: { warehouse_id: warehouseId, code: 'KE-A1' }, select: { id: true } }),
      id => this.db.stock_locations.create({ data: { id, warehouse_id: warehouseId, code: 'KE-A1', name: 'Kệ A1' }, select: { id: true } }),
    );
    const roleId = await this.getOrCreate(
      () => this.db.roles.findFirst({ where: { organization_id: orgId, code: 'ADMIN' }, select: { id: true } }),
      id => this.db.roles.create({ data: { id, organization_id: orgId, code: 'ADMIN', name: 'Quản trị viên' }, select: { id: true } }),
    );
    const userId = await this.getOrCreate(
      () => this.db.users.findFirst({ where: { organization_id: orgId, username: 'admin' }, select: { id: true } }),
      id => this.db.users.create({ data: { id, organization_id: orgId, username: 'admin', full_name: 'Quản trị viên' }, select: { id: true } }),
    );
    await this.getOrCreate(
      () => this.db.user_roles.findFirst({ where: { user_id: userId, role_id: roleId }, select: { id: true } }),
      id => this.db.user_roles.create({ data: { id, user_id: userId, role_id: roleId }, select: { id: true } }),
    );
    const tabletId = await this.unit('VIEN', 'Viên');
    const boxId = await this.unit('HOP', 'Hộp');
    const bottleId = await this.unit('CHAI', 'Chai');
    const sachetId = await this.unit('GOI', 'Gói');
    const tubeId = await this.unit('TUYP', 'Tuýp');
    const categories = new Map<string, string>();
    for (const name of [
      'Giảm đau & hạ sốt', 'Vitamin & khoáng chất', 'Kháng sinh', 'Tiêu hóa',
      'Tim mạch', 'Dị ứng', 'Hô hấp', 'Da liễu', 'Mắt & tai', 'Sát khuẩn',
    ]) {
      categories.set(name, await this.getOrCreate(
        () => this.db.categories.findFirst({ where: { organization_id: orgId, name }, select: { id: true } }),
        id => this.db.categories.create({ data: { id, organization_id: orgId, name }, select: { id: true } }),
      ));
    }
    const supplierA = await this.getOrCreate(
      () => this.db.suppliers.findFirst({ where: { organization_id: orgId, code: 'NCC-DUOCHAU' }, select: { id: true } }),
      id => this.db.suppliers.create({ data: { id, organization_id: orgId, code: 'NCC-DUOCHAU', name: 'Dược Hậu Giang', phone: '02923891433' }, select: { id: true } }),
    );
    const supplierB = await this.getOrCreate(
      () => this.db.suppliers.findFirst({ where: { organization_id: orgId, code: 'NCC-TRAPHACO' }, select: { id: true } }),
      id => this.db.suppliers.create({ data: { id, organization_id: orgId, code: 'NCC-TRAPHACO', name: 'Traphaco', phone: '02436831596' }, select: { id: true } }),
    );

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
      const productId = await this.getOrCreate(
        () => this.db.products.findFirst({ where: { organization_id: orgId, sku: med.sku }, select: { id: true } }),
        id => this.db.products.create({ data: {
          id,
          organization_id: orgId,
          sku: med.sku,
          name: med.name,
          category_id: categories.get(med.cat) ?? null,
          active_ingredient: med.ingredient,
          strength: med.strength,
          dosage_form: med.form,
          prescription_type: med.prescriptionType,
          base_unit_id: med.unit,
        }, select: { id: true } }),
      );
      await this.getOrCreate(
        () => this.db.product_units.findFirst({ where: { product_id: productId, unit_id: med.unit }, select: { id: true } }),
        id => this.db.product_units.create({ data: { id, product_id: productId, unit_id: med.unit, is_base_unit: true }, select: { id: true } }),
      );
      const lotId = await this.getOrCreate(
        () => this.db.inventory_lots.findFirst({ where: { organization_id: orgId, product_id: productId, batch_number: med.batch }, select: { id: true } }),
        id => this.db.inventory_lots.create({ data: {
          id,
          organization_id: orgId,
          product_id: productId,
          batch_number: med.batch,
          manufacturing_date: new Date(`${day(-90)}T00:00:00.000Z`),
          expiry_date: new Date(`${med.expiry}T00:00:00.000Z`),
        }, select: { id: true } }),
      );
      const balance = await this.db.inventory_balances.findFirst({ where: { organization_id: orgId, lot_id: lotId }, select: { lot_id: true } });
      if (!balance) seeded.push({ productId, lotId, qty: med.qty, cost: med.cost, supplier: med.supplier });
    }
    for (const supplierId of [supplierA, supplierB]) {
      const lines = seeded.filter(m => m.supplier === supplierId).map(m => ({ productId: m.productId, lotId: m.lotId, quantity: m.qty, purchasePrice: m.cost }));
      if (lines.length) await this.inventory.receive(admin, { supplierId, lines });
    }
    const issueCount = await this.db.stock_adjustments.count({ where: { organization_id: orgId } });
    if (issueCount === 0 && seeded.length >= 3) await this.inventory.issue(admin, { reasonCode: 'INTERNAL_USE', note: 'Dữ liệu mẫu: sử dụng nội bộ', lines: [
      { productId: seeded[0].productId, lotId: seeded[0].lotId, quantity: 12 },
      { productId: seeded[2].productId, lotId: seeded[2].lotId, quantity: 4 },
    ] });
  }

  private async unit(code: string, name: string): Promise<string> {
    return this.getOrCreate(
      () => this.db.units.findUnique({ where: { code }, select: { id: true } }),
      id => this.db.units.create({ data: { id, code, name }, select: { id: true } }),
    );
  }

  private async getOrCreate(
    find: () => Promise<{ id: string } | null>,
    create: (id: string) => Promise<{ id: string }>,
  ): Promise<string> {
    const found = await find();
    if (found) return found.id;
    return (await create(randomUUID())).id;
  }
}
