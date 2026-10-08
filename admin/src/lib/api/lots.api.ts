import { apiClient } from './client';
import type { LotRequest } from './req/inventory.req';
import type { IdResponse, Lot } from './res/inventory.res';

export async function getLots(): Promise<Lot[]> {
  const { data } = await apiClient.get<Lot[]>('/lots');
  return data;
}

export async function createLot(request: LotRequest): Promise<IdResponse> {
  const { data } = await apiClient.post<IdResponse>('/lots', request);
  return data;
}

export async function updateLot(id: string, request: LotRequest): Promise<IdResponse> {
  const { data } = await apiClient.put<IdResponse>(`/lots/${id}`, request);
  return data;
}
