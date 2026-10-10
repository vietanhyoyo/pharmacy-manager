import { apiClient } from './client';
import { API_PREFIXES } from '@/constants/api-paths';
import type { OrderAction, OrderListQuery } from './req/orders.req';
import type { OrderBranch, OrderDetail, OrderPage } from './res/orders.res';

const base = `${API_PREFIXES.storefront}/admin`;
export async function getOrderBranches(): Promise<OrderBranch[]> {
  return (await apiClient.get<OrderBranch[]>(`${base}/branches`)).data;
}
export async function getOrders(query?: OrderListQuery): Promise<OrderPage> {
  return (await apiClient.get<OrderPage>(`${base}/orders`, { params: query })).data;
}
export async function getOrder(id: string): Promise<OrderDetail> {
  return (await apiClient.get<OrderDetail>(`${base}/orders/${id}`)).data;
}
export async function updateOrder(id: string, action: OrderAction): Promise<OrderDetail> {
  return (await apiClient.post<OrderDetail>(`${base}/orders/${id}/${action}`, {})).data;
}
