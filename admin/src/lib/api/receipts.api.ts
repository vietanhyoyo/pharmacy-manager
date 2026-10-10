import { apiClient } from './client';
import { API_PREFIXES } from '../../constants/api-paths';
import type { ReceiptRequest } from './req/receipts.req';
import type { Receipt, ReceiptCreatedResponse } from './res/receipts.res';

export async function getReceipts(): Promise<Receipt[]> {
  const { data } = await apiClient.get<Receipt[]>(`${API_PREFIXES.inventory}/receipts`);
  return data;
}

export async function createReceipt(request: ReceiptRequest): Promise<ReceiptCreatedResponse> {
  const { data } = await apiClient.post<ReceiptCreatedResponse>(`${API_PREFIXES.inventory}/receipts`, request);
  return data;
}
