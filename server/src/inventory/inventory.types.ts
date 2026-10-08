export type ProductInput = {
  sku: string; name: string; categoryId?: string | null; activeIngredient?: string | null;
  strength?: string | null; dosageForm?: string | null; prescriptionType?: 'RX' | 'OTC' | 'OTHER';
  baseUnitId: string; status?: 'ACTIVE' | 'INACTIVE';
};
export type SupplierInput = { code: string; name: string; phone?: string | null; status?: 'ACTIVE' | 'INACTIVE' };
export type LotInput = { productId: string; batchNumber: string; manufacturingDate?: string | null; expiryDate: string; status?: 'ACTIVE' | 'BLOCKED' | 'QUARANTINED' | 'CLOSED' };
export type ReceiptInput = { supplierId: string; receivedAt?: string; lines: { productId: string; lotId: string; quantity: number; purchasePrice: number }[] };
export type IssueInput = { reasonCode: 'INTERNAL_USE' | 'DAMAGED' | 'EXPIRED' | 'SAMPLE' | 'OTHER'; note?: string; lines: { productId: string; lotId: string; quantity: number }[] };
