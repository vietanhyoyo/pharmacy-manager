import { apiClient } from './client';
import { API_PREFIXES } from '../../constants/api-paths';
import type { Dashboard } from './res/dashboard.res';

export async function getDashboard(): Promise<Dashboard> {
  const { data } = await apiClient.get<Dashboard>(`${API_PREFIXES.inventory}/dashboard`);
  return data;
}
