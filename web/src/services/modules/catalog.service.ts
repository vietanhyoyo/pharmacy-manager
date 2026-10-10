import { apiClient } from '../api_client';
import type { CatalogCategory, CatalogPage, CatalogProduct } from '../types/response/catalog-res';

export async function fetchCategories(): Promise<CatalogCategory[]> {
  const { data } = await apiClient.get<CatalogCategory[]>('/categories');
  return data;
}

export async function fetchProducts(params: { search?: string; category?: string; page?: number } = {}): Promise<CatalogPage> {
  const { data } = await apiClient.get<CatalogPage>('/products', { params });
  return data;
}

export async function fetchProduct(slug: string): Promise<CatalogProduct> {
  const { data } = await apiClient.get<CatalogProduct>(`/products/${encodeURIComponent(slug)}`);
  return data;
}
