export type ProductRequest = {
  sku: string;
  name: string;
  categoryId?: string | null;
  activeIngredient?: string | null;
  strength?: string | null;
  dosageForm?: string | null;
  prescriptionType?: 'RX' | 'OTC' | 'OTHER';
  baseUnitId: string;
  status?: 'ACTIVE' | 'INACTIVE';
};

export type SupplierRequest = {
  code: string;
  name: string;
  phone?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
};

export type LotRequest = {
  productId: string;
  batchNumber: string;
  manufacturingDate?: string | null;
  expiryDate: string;
  status?: 'ACTIVE' | 'BLOCKED' | 'QUARANTINED' | 'CLOSED';
};

export type ReceiptLineRequest = {
  productId: string;
  lotId: string;
  quantity: number;
  purchasePrice: number;
};

export type ReceiptRequest = {
  supplierId: string;
  receivedAt?: string;
  lines: ReceiptLineRequest[];
};

export type IssueReasonCode = 'INTERNAL_USE' | 'DAMAGED' | 'EXPIRED' | 'SAMPLE' | 'OTHER';

export type IssueLineRequest = {
  productId: string;
  lotId: string;
  quantity: number;
};

export type IssueRequest = {
  reasonCode: IssueReasonCode;
  note?: string;
  lines: IssueLineRequest[];
};

export type InventoryWriteRequest = ProductRequest | SupplierRequest | LotRequest | ReceiptRequest | IssueRequest;
export type InventoryWriteSection = 'products' | 'suppliers' | 'lots' | 'receipts' | 'issues';
