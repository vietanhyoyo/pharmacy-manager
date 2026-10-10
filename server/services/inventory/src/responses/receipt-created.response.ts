import type { IdResponse } from './id.response';

export type ReceiptCreatedResponse = IdResponse & {
  receiptNumber: string;
};
