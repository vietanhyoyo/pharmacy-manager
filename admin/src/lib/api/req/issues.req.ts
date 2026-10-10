export type IssueReasonCode = 'INTERNAL_USE' | 'DAMAGED' | 'EXPIRED' | 'SAMPLE' | 'OTHER';

export type IssueLineRequest = {
  productId: string;
  lotId: string;
  quantity: number;
};

export type IssueRequest = {
  warehouseId: string;
  reasonCode: IssueReasonCode;
  note?: string;
  lines: IssueLineRequest[];
};
