import type { IdResponse } from './common.res';

export type Receipt = {
  id: string;
  receiptNumber: string;
  receivedAt: string;
  status: string;
  supplierName: string;
  lineCount: number;
  totalQuantity: string;
  totalAmount: string;
};

export type ReceiptCreatedResponse = IdResponse & { receiptNumber: string };
