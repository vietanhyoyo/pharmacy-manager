import { apiClient } from './client';
import { API_PREFIXES } from '../../constants/api-paths';
import type { LotRequest } from './req/lots.req';
import type { IdResponse } from './res/common.res';
import type { Lot } from './res/lots.res';

export async function getLots(): Promise<Lot[]> {
  const { data } = await apiClient.get<Lot[]>(`${API_PREFIXES.inventory}/lots`);
  return data;
}

export async function createLot(request: LotRequest): Promise<IdResponse> {
  const { data } = await apiClient.post<IdResponse>(`${API_PREFIXES.inventory}/lots`, request);
  return data;
}

export async function updateLot(id: string, request: LotRequest): Promise<IdResponse> {
  const { data } = await apiClient.put<IdResponse>(`${API_PREFIXES.inventory}/lots/${id}`, request);
  return data;
}
