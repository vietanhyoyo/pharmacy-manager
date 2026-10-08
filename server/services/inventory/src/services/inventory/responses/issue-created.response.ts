import type { IdResponse } from './id.response';

export type IssueCreatedResponse = IdResponse & {
  issueNumber: string;
};
