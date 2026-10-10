import type { ReceiptLineRequest } from './receipt-line.request';

export type { ReceiptLineRequest } from './receipt-line.request';

export type ReceiptRequest = {
  warehouseId?: string;
  supplierId: string;
  receivedAt?: string;
  lines: ReceiptLineRequest[];
};
