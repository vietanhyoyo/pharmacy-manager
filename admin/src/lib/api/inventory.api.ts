import { apiClient } from './client';
import type { InventoryWriteRequest, InventoryWriteSection } from './req/inventory.req';
import type { Dashboard, InventoryListResponse, InventoryListSection, Lookups } from './res/inventory.res';

const sectionEndpoints: Record<InventoryListSection, string> = {
  products: 'products',
  lots: 'lots',
  stock: 'stock',
  receipts: 'receipts',
  issues: 'issues',
  suppliers: 'suppliers',
  movements: 'movements',
};

export async function getDashboard(): Promise<Dashboard> {
  const { data } = await apiClient.get<Dashboard>('/backend/admin/dashboard');
  return data;
}

export async function getLookups(): Promise<Lookups> {
  const { data } = await apiClient.get<Lookups>('/backend/admin/lookups');
  return data;
}

export async function getInventorySection(section: InventoryListSection): Promise<InventoryListResponse> {
  const { data } = await apiClient.get<InventoryListResponse>(`/backend/admin/${sectionEndpoints[section]}`);
  return data;
}

export async function saveInventoryRecord(
  section: InventoryWriteSection,
  request: InventoryWriteRequest,
  id?: string,
): Promise<void> {
  const path = `/backend/admin/${section}${id ? `/${id}` : ''}`;
  await apiClient.request({ method: id ? 'put' : 'post', url: path, data: request });
}
