import { apiClient } from '../api_client';
import type { CheckoutRequest, CheckoutResponse } from '../types/response/order-res';

export async function createOrder(input: CheckoutRequest): Promise<CheckoutResponse> {
  const { data } = await apiClient.post<CheckoutResponse>('/orders', input);
  return data;
}
