import { apiClient } from './client';
import type { Lookups } from './res/inventory.res';

export async function getLookups(): Promise<Lookups> {
  const { data } = await apiClient.get<Lookups>('/lookups');
  return data;
}
