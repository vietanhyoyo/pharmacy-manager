import { apiClient } from './client';
import type { LotRequest } from './req/inventory.req';
import type { IdResponse, Lot } from './res/inventory.res';

export async function getLots(): Promise<Lot[]> {
  const { data } = await apiClient.get<Lot[]>('/v1/inventory/lots');
  return data;
}

export async function createLot(request: LotRequest): Promise<IdResponse> {
  const { data } = await apiClient.post<IdResponse>('/v1/inventory/lots', request);
  return data;
}

export async function updateLot(id: string, request: LotRequest): Promise<IdResponse> {
  const { data } = await apiClient.put<IdResponse>(`/v1/inventory/lots/${id}`, request);
  return data;
}
