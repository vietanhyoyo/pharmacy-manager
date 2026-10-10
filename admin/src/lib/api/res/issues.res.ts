import type { IdResponse } from './common.res';

export type Issue = {
  id: string;
  issueNumber: string;
  issuedAt: string;
  reasonCode: string;
  status: string;
  lineCount: number;
  totalQuantity: string;
};

export type IssueCreatedResponse = IdResponse & { issueNumber: string };
