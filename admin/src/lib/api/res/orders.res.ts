import type { OrderAction } from '../req/orders.req';

export type OrderBranch = { id: string; code: string; name: string; address: string | null };
export type OrderSummary = {
  id: string; orderNumber: string; status: string; paymentStatus: string;
  branchId: string; branchName: string; recipientName: string | null; recipientPhone: string | null;
  total: number; lineCount: number; placedAt: string;
};
export type OrderPage = { items: OrderSummary[]; total: number; page: number; pageSize: number; totalPages: number };
export type OrderDetail = {
  id: string; orderNumber: string; status: string; paymentStatus: string; pendingAction: OrderAction | null;
  branchId: string; branchName: string; branchCode: string; recipientName: string | null; recipientPhone: string | null;
  address: string; subtotal: number; total: number; placedAt: string;
  confirmedAt: string | null; completedAt: string | null; cancelledAt: string | null;
  lines: { id: string; name: string; sku: string; unit: string; quantity: number; unitPrice: number; total: number }[];
  events: { id: string; fromStatus: string | null; toStatus: string; note: string | null; createdAt: string }[];
  shipment: { status: string; shippedAt: string | null; deliveredAt: string | null } | null;
};
