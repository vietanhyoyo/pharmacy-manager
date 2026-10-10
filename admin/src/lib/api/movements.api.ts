import { apiClient } from './client';
import { API_PREFIXES } from '../../constants/api-paths';
import type { Movement } from './res/movements.res';

export async function getMovements(): Promise<Movement[]> {
  const { data } = await apiClient.get<Movement[]>(`${API_PREFIXES.inventory}/movements`);
  return data;
}
