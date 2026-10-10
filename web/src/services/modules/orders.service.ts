import { apiClient } from '../api_client';
import type { CheckoutRequest, CheckoutResponse } from '../types/response/order-res';

export async function createOrder(input: CheckoutRequest): Promise<CheckoutResponse> {
  const { data } = await apiClient.post<CheckoutResponse>('/orders', input);
  return data;
}

export async function trackOrder(number: string, phone: string): Promise<{ orderNumber: string; status: string; paymentStatus: string; placedAt: string; total: number; branchName: string }> {
  const { data } = await apiClient.get('/orders/track', { params: { number, phone } });
  return data;
}
