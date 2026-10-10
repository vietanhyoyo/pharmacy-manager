export interface CheckoutRequest {
  idempotencyKey: string;
  customer: { name: string; phone: string };
  delivery: { address: string; ward?: string; district?: string; province: string };
  items: { productId: string; productUnitId: string; quantity: number }[];
}

export interface CheckoutResponse {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
}
