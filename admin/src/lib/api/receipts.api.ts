import { apiClient } from './client';
import type { ReceiptRequest } from './req/inventory.req';
import type { Receipt, ReceiptCreatedResponse } from './res/inventory.res';

export async function getReceipts(): Promise<Receipt[]> {
  const { data } = await apiClient.get<Receipt[]>('/receipts');
  return data;
}

export async function createReceipt(request: ReceiptRequest): Promise<ReceiptCreatedResponse> {
  const { data } = await apiClient.post<ReceiptCreatedResponse>('/receipts', request);
  return data;
}
