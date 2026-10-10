import { apiClient } from './client';
import { API_PREFIXES } from '../../constants/api-paths';
import type { SupplierRequest } from './req/suppliers.req';
import type { IdResponse } from './res/common.res';
import type { Supplier } from './res/suppliers.res';

export async function getSuppliers(): Promise<Supplier[]> {
  const { data } = await apiClient.get<Supplier[]>(`${API_PREFIXES.inventory}/suppliers`);
  return data;
}

export async function createSupplier(request: SupplierRequest): Promise<IdResponse> {
  const { data } = await apiClient.post<IdResponse>(`${API_PREFIXES.inventory}/suppliers`, request);
  return data;
}

export async function updateSupplier(id: string, request: SupplierRequest): Promise<IdResponse> {
  const { data } = await apiClient.put<IdResponse>(`${API_PREFIXES.inventory}/suppliers/${id}`, request);
  return data;
}
