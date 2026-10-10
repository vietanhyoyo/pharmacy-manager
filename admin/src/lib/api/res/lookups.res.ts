export type Lookups = {
  categories: { id: string; name: string }[];
  units: { id: string; code: string; name: string }[];
  suppliers: { id: string; code: string; name: string }[];
  products: { id: string; sku: string; name: string; productUnitId: string }[];
  lots: { id: string; productId: string; batchNumber: string; expiryDate: string }[];
  warehouses: { id: string; code: string; name: string; branchName: string | null }[];
};
