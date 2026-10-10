export type ReceiptLineRequest = {
  productId: string;
  lotId: string;
  quantity: number;
  purchasePrice: number;
};

export type ReceiptRequest = {
  supplierId: string;
  receivedAt?: string;
  lines: ReceiptLineRequest[];
};
