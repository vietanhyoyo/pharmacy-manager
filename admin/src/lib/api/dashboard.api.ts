import { apiClient } from './client';
import type { Dashboard } from './res/inventory.res';

export async function getDashboard(): Promise<Dashboard> {
  const { data } = await apiClient.get<Dashboard>('/dashboard');
  return data;
}
