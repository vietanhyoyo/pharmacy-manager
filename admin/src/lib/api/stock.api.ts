import { apiClient } from './client';
import { API_PREFIXES } from '../../constants/api-paths';
import type { Stock } from './res/stock.res';

export async function getStock(): Promise<Stock[]> {
  const { data } = await apiClient.get<Stock[]>(`${API_PREFIXES.inventory}/stock`);
  return data;
}
