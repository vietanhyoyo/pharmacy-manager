export type Stock = {
  productId: string;
  sku: string;
  productName: string;
  lotId: string;
  batchNumber: string;
  expiryDate: string | null;
  warehouseName: string;
  onHandQty: string;
  reservedQty: string;
  availableQty: string;
};
