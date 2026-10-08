export type LotRequest = {
  productId: string;
  batchNumber: string;
  manufacturingDate?: string | null;
  expiryDate: string;
  status?: 'ACTIVE' | 'BLOCKED' | 'QUARANTINED' | 'CLOSED';
};
