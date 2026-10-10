import type { IssueLineRequest } from './issue-line.request';
import type { IssueReasonCode } from './issue-reason-code.request';

export type { IssueLineRequest } from './issue-line.request';
export type { IssueReasonCode } from './issue-reason-code.request';

export type IssueRequest = {
  reasonCode: IssueReasonCode;
  note?: string;
  lines: IssueLineRequest[];
};
