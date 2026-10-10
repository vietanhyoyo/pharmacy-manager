import { apiClient } from './client';
import { API_PREFIXES } from '../../constants/api-paths';
import type { Lookups } from './res/lookups.res';

export async function getLookups(): Promise<Lookups> {
  const { data } = await apiClient.get<Lookups>(`${API_PREFIXES.inventory}/lookups`);
  return data;
}
