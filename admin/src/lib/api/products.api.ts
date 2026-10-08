import { apiClient } from './client';
import type { ProductRequest } from './req/inventory.req';
import type { IdResponse, Product } from './res/inventory.res';

export async function getProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>('/v1/inventory/products');
  return data;
}

export async function createProduct(request: ProductRequest): Promise<IdResponse> {
  const { data } = await apiClient.post<IdResponse>('/v1/inventory/products', request);
  return data;
}

export async function updateProduct(id: string, request: ProductRequest): Promise<IdResponse> {
  const { data } = await apiClient.put<IdResponse>(`/v1/inventory/products/${id}`, request);
  return data;
}
