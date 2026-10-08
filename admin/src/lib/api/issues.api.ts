import { apiClient } from './client';
import type { IssueRequest } from './req/inventory.req';
import type { Issue, IssueCreatedResponse } from './res/inventory.res';

export async function getIssues(): Promise<Issue[]> {
  const { data } = await apiClient.get<Issue[]>('/issues');
  return data;
}

export async function createIssue(request: IssueRequest): Promise<IssueCreatedResponse> {
  const { data } = await apiClient.post<IssueCreatedResponse>('/issues', request);
  return data;
}
