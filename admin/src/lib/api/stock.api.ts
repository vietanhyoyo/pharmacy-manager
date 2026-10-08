import { apiClient } from './client';
import type { Stock } from './res/inventory.res';

export async function getStock(): Promise<Stock[]> {
  const { data } = await apiClient.get<Stock[]>('/v1/inventory/stock');
  return data;
}
