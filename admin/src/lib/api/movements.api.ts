import { apiClient } from './client';
import type { Movement } from './res/movements.res';

export async function getMovements(): Promise<Movement[]> {
  const { data } = await apiClient.get<Movement[]>('/v1/inventory/movements');
  return data;
}
