import type { Movement } from './movements.res';

export type Dashboard = {
  products: number;
  suppliers: number;
  lots: number;
  totalUnits: string;
  receipts: number;
  issues: number;
  lowStock: { id: string; sku: string; name: string; quantity: string }[];
  expiring: { id: string; batchNumber: string; expiryDate: string; productName: string; quantity: string }[];
  recent: Movement[];
};
