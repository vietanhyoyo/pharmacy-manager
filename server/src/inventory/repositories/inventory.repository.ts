import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdminUser } from '../../auth/auth.service';

@Injectable()
export class InventoryRepository {
  constructor(readonly db: DataSource) {}

  async context(orgId: string) {
    const rows = await this.db.query(`SELECT b.id branchId, w.id warehouseId, l.id locationId
      FROM branches b JOIN warehouses w ON w.branch_id=b.id AND w.status='ACTIVE'
      JOIN stock_locations l ON l.warehouse_id=w.id AND l.status='ACTIVE'
      WHERE b.organization_id=? AND b.status='ACTIVE' ORDER BY b.created_at, w.created_at, l.created_at LIMIT 1`, [orgId]);
    return rows[0] as { branchId: string; warehouseId: string; locationId: string } | undefined;
  }

  async lookups(user: AdminUser) {
    const [categories, units, suppliers, products, lots, warehouses] = await Promise.all([
      this.db.query('SELECT id, name FROM categories WHERE organization_id=? ORDER BY name', [user.organizationId]),
      this.db.query('SELECT id, code, name FROM units ORDER BY name'),
      this.db.query("SELECT id, code, name FROM suppliers WHERE organization_id=? AND status='ACTIVE' ORDER BY name", [user.organizationId]),
      this.db.query("SELECT p.id, p.sku, p.name, pu.id productUnitId FROM products p JOIN product_units pu ON pu.product_id=p.id AND pu.is_base_unit=1 WHERE p.organization_id=? AND p.status='ACTIVE' ORDER BY p.name", [user.organizationId]),
      this.db.query("SELECT l.id, l.product_id productId, l.batch_number batchNumber, l.expiry_date expiryDate FROM inventory_lots l WHERE l.organization_id=? AND l.status='ACTIVE' ORDER BY l.expiry_date", [user.organizationId]),
      this.db.query('SELECT id, code, name FROM warehouses WHERE organization_id=? ORDER BY name', [user.organizationId]),
    ]);
    return { categories, units, suppliers, products, lots, warehouses };
  }

  async dashboard(user: AdminUser) {
    const [counts, lowStock, expiring, recent] = await Promise.all([
      this.db.query(`SELECT
        (SELECT COUNT(*) FROM products WHERE organization_id=?) products,
        (SELECT COUNT(*) FROM suppliers WHERE organization_id=?) suppliers,
        (SELECT COUNT(*) FROM inventory_lots WHERE organization_id=?) lots,
        (SELECT COALESCE(SUM(on_hand_qty),0) FROM inventory_balances WHERE organization_id=?) totalUnits,
        (SELECT COUNT(*) FROM goods_receipts WHERE organization_id=? AND status='POSTED') receipts,
        (SELECT COUNT(*) FROM stock_adjustments WHERE organization_id=? AND status='POSTED') issues`, Array(6).fill(user.organizationId)),
      this.db.query(`SELECT p.id, p.sku, p.name, COALESCE(SUM(b.on_hand_qty),0) quantity FROM products p
        LEFT JOIN inventory_balances b ON b.product_id=p.id AND b.organization_id=p.organization_id
        WHERE p.organization_id=? AND p.status='ACTIVE' GROUP BY p.id, p.sku, p.name
        HAVING quantity < 30 ORDER BY quantity LIMIT 6`, [user.organizationId]),
      this.db.query(`SELECT l.id, l.batch_number batchNumber, l.expiry_date expiryDate, p.name productName,
        COALESCE(SUM(b.on_hand_qty),0) quantity FROM inventory_lots l JOIN products p ON p.id=l.product_id
        LEFT JOIN inventory_balances b ON b.lot_id=l.id AND b.organization_id=l.organization_id
        WHERE l.organization_id=? AND l.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY)
        GROUP BY l.id, l.batch_number, l.expiry_date, p.name HAVING quantity > 0
        ORDER BY l.expiry_date LIMIT 6`, [user.organizationId]),
      this.db.query(`SELECT m.id, m.movement_type movementType, m.quantity_delta quantityDelta, m.posted_at postedAt,
        p.name productName, l.batch_number batchNumber, m.reference_no referenceNo
        FROM inventory_movements m JOIN products p ON p.id=m.product_id JOIN inventory_lots l ON l.id=m.lot_id
        WHERE m.organization_id=? ORDER BY m.ledger_seq DESC LIMIT 8`, [user.organizationId]),
    ]);
    return { ...counts[0], lowStock, expiring, recent };
  }

  products(orgId: string) {
    return this.db.query(`SELECT p.id, p.sku, p.name, p.active_ingredient activeIngredient, p.strength, p.dosage_form dosageForm,
      p.prescription_type prescriptionType, p.category_id categoryId, c.name categoryName, p.base_unit_id baseUnitId,
      u.name unitName, p.status, COALESCE(SUM(b.on_hand_qty),0) quantity
      FROM products p LEFT JOIN categories c ON c.id=p.category_id JOIN units u ON u.id=p.base_unit_id
      LEFT JOIN inventory_balances b ON b.product_id=p.id AND b.organization_id=p.organization_id
      WHERE p.organization_id=? GROUP BY p.id, p.sku, p.name, p.active_ingredient, p.strength, p.dosage_form,
      p.prescription_type, p.category_id, c.name, p.base_unit_id, u.name, p.status ORDER BY p.created_at DESC`, [orgId]);
  }

  suppliers(orgId: string) { return this.db.query('SELECT id, code, name, phone, status FROM suppliers WHERE organization_id=? ORDER BY created_at DESC', [orgId]); }

  lots(orgId: string) {
    return this.db.query(`SELECT l.id, l.product_id productId, p.name productName, p.sku, l.batch_number batchNumber,
      l.manufacturing_date manufacturingDate, l.expiry_date expiryDate, l.status,
      COALESCE(SUM(b.on_hand_qty),0) quantity FROM inventory_lots l JOIN products p ON p.id=l.product_id
      LEFT JOIN inventory_balances b ON b.lot_id=l.id AND b.organization_id=l.organization_id
      WHERE l.organization_id=? GROUP BY l.id, l.product_id, p.name, p.sku, l.batch_number,
      l.manufacturing_date, l.expiry_date, l.status ORDER BY l.expiry_date`, [orgId]);
  }

  stock(orgId: string) {
    return this.db.query(`SELECT b.product_id productId, p.sku, p.name productName, b.lot_id lotId,
      l.batch_number batchNumber, l.expiry_date expiryDate, w.name warehouseName,
      b.on_hand_qty onHandQty, b.reserved_qty reservedQty, (b.on_hand_qty-b.reserved_qty) availableQty
      FROM inventory_balances b JOIN products p ON p.id=b.product_id JOIN inventory_lots l ON l.id=b.lot_id
      JOIN warehouses w ON w.id=b.warehouse_id WHERE b.organization_id=? ORDER BY p.name, l.expiry_date`, [orgId]);
  }

  receipts(orgId: string) {
    return this.db.query(`SELECT r.id, r.receipt_number receiptNumber, r.received_at receivedAt, r.status,
      s.name supplierName, COUNT(rl.id) lineCount, COALESCE(SUM(rl.base_quantity),0) totalQuantity,
      COALESCE(SUM(rl.line_total),0) totalAmount FROM goods_receipts r JOIN suppliers s ON s.id=r.supplier_id
      LEFT JOIN goods_receipt_lines rl ON rl.goods_receipt_id=r.id WHERE r.organization_id=?
      GROUP BY r.id, r.receipt_number, r.received_at, r.status, s.name ORDER BY r.received_at DESC`, [orgId]);
  }

  issues(orgId: string) {
    return this.db.query(`SELECT a.id, a.adjustment_number issueNumber, a.adjusted_at issuedAt, a.reason_code reasonCode,
      a.status, COUNT(al.id) lineCount, COALESCE(SUM(-al.quantity_delta),0) totalQuantity
      FROM stock_adjustments a LEFT JOIN stock_adjustment_lines al ON al.stock_adjustment_id=a.id
      WHERE a.organization_id=? AND a.reason_code IN ('INTERNAL_USE','DAMAGED','EXPIRED','SAMPLE','OTHER')
      GROUP BY a.id, a.adjustment_number, a.adjusted_at, a.reason_code, a.status ORDER BY a.adjusted_at DESC`, [orgId]);
  }

  movements(orgId: string) {
    return this.db.query(`SELECT m.id, m.ledger_seq ledgerSeq, m.movement_type movementType,
      m.quantity_delta quantityDelta, m.posted_at postedAt, m.reference_no referenceNo, p.name productName,
      l.batch_number batchNumber FROM inventory_movements m JOIN products p ON p.id=m.product_id
      JOIN inventory_lots l ON l.id=m.lot_id WHERE m.organization_id=? ORDER BY m.ledger_seq DESC LIMIT 200`, [orgId]);
  }
}
