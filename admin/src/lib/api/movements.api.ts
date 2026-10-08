import { apiClient } from './client';
import type { Movement } from './res/inventory.res';

export async function getMovements(): Promise<Movement[]> {
  const { data } = await apiClient.get<Movement[]>('/movements');
  return data;
}
