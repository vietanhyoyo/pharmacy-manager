import { apiClient } from './client';
import type { ReceiptRequest } from './req/receipts.req';
import type { Receipt, ReceiptCreatedResponse } from './res/receipts.res';

export async function getReceipts(): Promise<Receipt[]> {
  const { data } = await apiClient.get<Receipt[]>('/v1/inventory/receipts');
  return data;
}

export async function createReceipt(request: ReceiptRequest): Promise<ReceiptCreatedResponse> {
  const { data } = await apiClient.post<ReceiptCreatedResponse>('/v1/inventory/receipts', request);
  return data;
}
