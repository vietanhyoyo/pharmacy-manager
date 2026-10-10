export type Lot = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  batchNumber: string;
  manufacturingDate: string | null;
  expiryDate: string | null;
  status: string;
  quantity: string;
};
