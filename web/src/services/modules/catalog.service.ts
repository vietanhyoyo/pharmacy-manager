import { apiClient } from '../api_client';
import type { CatalogCategory, CatalogPage, CatalogProduct, StoreBranch } from '../types/response/catalog-res';
import { cookies } from 'next/headers';

async function selectedBranchId(): Promise<string | undefined> {
  if (typeof window !== 'undefined') return document.cookie.match(/(?:^|; )storefront_branch=([^;]+)/)?.[1];
  return (await cookies()).get('storefront_branch')?.value;
}

export async function fetchBranches(): Promise<StoreBranch[]> {
  const { data } = await apiClient.get<StoreBranch[]>('/branches');
  return data;
}

export async function fetchCategories(): Promise<CatalogCategory[]> {
  const { data } = await apiClient.get<CatalogCategory[]>('/categories', { params: { branchId: await selectedBranchId() } });
  return data;
}

export async function fetchProducts(params: { search?: string; category?: string; page?: number } = {}): Promise<CatalogPage> {
  const { data } = await apiClient.get<CatalogPage>('/products', { params: { ...params, branchId: await selectedBranchId() } });
  return data;
}

export async function fetchProduct(slug: string): Promise<CatalogProduct> {
  const { data } = await apiClient.get<CatalogProduct>(`/products/${encodeURIComponent(slug)}`, { params: { branchId: await selectedBranchId() } });
  return data;
}
