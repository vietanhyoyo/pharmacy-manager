// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
import { Organizations } from './organizations.entity';
import { Branches } from './branches.entity';
import { Warehouses } from './warehouses.entity';
import { StockLocations } from './stock_locations.entity';
import { Users } from './users.entity';
import { Roles } from './roles.entity';
import { Permissions } from './permissions.entity';
import { UserRoles } from './user_roles.entity';
import { RolePermissions } from './role_permissions.entity';
import { UserBranchAccess } from './user_branch_access.entity';
import { Categories } from './categories.entity';
import { Manufacturers } from './manufacturers.entity';
import { Units } from './units.entity';
import { Products } from './products.entity';
import { ProductUnits } from './product_units.entity';
import { ProductBarcodes } from './product_barcodes.entity';
import { Suppliers } from './suppliers.entity';
import { Customers } from './customers.entity';
import { InventoryLots } from './inventory_lots.entity';
import { InventoryMovements } from './inventory_movements.entity';
import { InventoryBalances } from './inventory_balances.entity';
import { InventoryReservations } from './inventory_reservations.entity';
import { PurchaseOrders } from './purchase_orders.entity';
import { PurchaseOrderLines } from './purchase_order_lines.entity';
import { GoodsReceipts } from './goods_receipts.entity';
import { GoodsReceiptLines } from './goods_receipt_lines.entity';
import { PosDevices } from './pos_devices.entity';
import { PosShifts } from './pos_shifts.entity';
import { Sales } from './sales.entity';
import { SaleLines } from './sale_lines.entity';
import { SaleLineAllocations } from './sale_line_allocations.entity';
import { SalePayments } from './sale_payments.entity';
import { StockTransfers } from './stock_transfers.entity';
import { StockTransferLines } from './stock_transfer_lines.entity';
import { StockCounts } from './stock_counts.entity';
import { StockCountLines } from './stock_count_lines.entity';
import { StockAdjustments } from './stock_adjustments.entity';
import { StockAdjustmentLines } from './stock_adjustment_lines.entity';
import { SalesReturns } from './sales_returns.entity';
import { SalesReturnLines } from './sales_return_lines.entity';
import { SupplierReturns } from './supplier_returns.entity';
import { SupplierReturnLines } from './supplier_return_lines.entity';
import { PriceLists } from './price_lists.entity';
import { PriceListItems } from './price_list_items.entity';
import { Promotions } from './promotions.entity';
import { AuditLogs } from './audit_logs.entity';
import { DocumentSequences } from './document_sequences.entity';
import { CartItems } from './cart_items.entity';
import { Carts } from './carts.entity';
import { CustomerAccounts } from './customer_accounts.entity';
import { CustomerAddresses } from './customer_addresses.entity';
import { OrderDiscounts } from './order_discounts.entity';
import { OrderEvents } from './order_events.entity';
import { OrderLines } from './order_lines.entity';
import { OrderPrescriptions } from './order_prescriptions.entity';
import { Orders } from './orders.entity';
import { PaymentAttempts } from './payment_attempts.entity';
import { ProductListings } from './product_listings.entity';
import { PromotionProducts } from './promotion_products.entity';
import { Shipments } from './shipments.entity';

export { Organizations } from './organizations.entity';
export { Branches } from './branches.entity';
export { Warehouses } from './warehouses.entity';
export { StockLocations } from './stock_locations.entity';
export { Users } from './users.entity';
export { Roles } from './roles.entity';
export { Permissions } from './permissions.entity';
export { UserRoles } from './user_roles.entity';
export { RolePermissions } from './role_permissions.entity';
export { UserBranchAccess } from './user_branch_access.entity';
export { Categories } from './categories.entity';
export { Manufacturers } from './manufacturers.entity';
export { Units } from './units.entity';
export { Products } from './products.entity';
export { ProductUnits } from './product_units.entity';
export { ProductBarcodes } from './product_barcodes.entity';
export { Suppliers } from './suppliers.entity';
export { Customers } from './customers.entity';
export { InventoryLots } from './inventory_lots.entity';
export { InventoryMovements } from './inventory_movements.entity';
export { InventoryBalances } from './inventory_balances.entity';
export { InventoryReservations } from './inventory_reservations.entity';
export { PurchaseOrders } from './purchase_orders.entity';
export { PurchaseOrderLines } from './purchase_order_lines.entity';
export { GoodsReceipts } from './goods_receipts.entity';
export { GoodsReceiptLines } from './goods_receipt_lines.entity';
export { PosDevices } from './pos_devices.entity';
export { PosShifts } from './pos_shifts.entity';
export { Sales } from './sales.entity';
export { SaleLines } from './sale_lines.entity';
export { SaleLineAllocations } from './sale_line_allocations.entity';
export { SalePayments } from './sale_payments.entity';
export { StockTransfers } from './stock_transfers.entity';
export { StockTransferLines } from './stock_transfer_lines.entity';
export { StockCounts } from './stock_counts.entity';
export { StockCountLines } from './stock_count_lines.entity';
export { StockAdjustments } from './stock_adjustments.entity';
export { StockAdjustmentLines } from './stock_adjustment_lines.entity';
export { SalesReturns } from './sales_returns.entity';
export { SalesReturnLines } from './sales_return_lines.entity';
export { SupplierReturns } from './supplier_returns.entity';
export { SupplierReturnLines } from './supplier_return_lines.entity';
export { PriceLists } from './price_lists.entity';
export { PriceListItems } from './price_list_items.entity';
export { Promotions } from './promotions.entity';
export { AuditLogs } from './audit_logs.entity';
export { DocumentSequences } from './document_sequences.entity';
export { CartItems } from './cart_items.entity';
export { Carts } from './carts.entity';
export { CustomerAccounts } from './customer_accounts.entity';
export { CustomerAddresses } from './customer_addresses.entity';
export { OrderDiscounts } from './order_discounts.entity';
export { OrderEvents } from './order_events.entity';
export { OrderLines } from './order_lines.entity';
export { OrderPrescriptions } from './order_prescriptions.entity';
export { Orders } from './orders.entity';
export { PaymentAttempts } from './payment_attempts.entity';
export { ProductListings } from './product_listings.entity';
export { PromotionProducts } from './promotion_products.entity';
export { Shipments } from './shipments.entity';

export const entities = [
  Organizations,
  Branches,
  Warehouses,
  StockLocations,
  Users,
  Roles,
  Permissions,
  UserRoles,
  RolePermissions,
  UserBranchAccess,
  Categories,
  Manufacturers,
  Units,
  Products,
  ProductUnits,
  ProductBarcodes,
  Suppliers,
  Customers,
  InventoryLots,
  InventoryMovements,
  InventoryBalances,
  InventoryReservations,
  PurchaseOrders,
  PurchaseOrderLines,
  GoodsReceipts,
  GoodsReceiptLines,
  PosDevices,
  PosShifts,
  Sales,
  SaleLines,
  SaleLineAllocations,
  SalePayments,
  StockTransfers,
  StockTransferLines,
  StockCounts,
  StockCountLines,
  StockAdjustments,
  StockAdjustmentLines,
  SalesReturns,
  SalesReturnLines,
  SupplierReturns,
  SupplierReturnLines,
  PriceLists,
  PriceListItems,
  Promotions,
  AuditLogs,
  DocumentSequences,
  CartItems,
  Carts,
  CustomerAccounts,
  CustomerAddresses,
  OrderDiscounts,
  OrderEvents,
  OrderLines,
  OrderPrescriptions,
  Orders,
  PaymentAttempts,
  ProductListings,
  PromotionProducts,
  Shipments,
] as const;
