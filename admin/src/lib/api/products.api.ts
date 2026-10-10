import { apiClient } from './client';
import type { ProductListQuery, ProductRequest } from './req/products.req';
import type { IdResponse } from './res/common.res';
import type { Product } from './res/products.res';

export async function getProducts(query: ProductListQuery = {}): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>('/v1/inventory/products', { params: query });
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
