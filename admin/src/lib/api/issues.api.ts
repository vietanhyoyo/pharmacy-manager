import { apiClient } from './client';
import { API_PREFIXES } from '../../constants/api-paths';
import type { IssueRequest } from './req/issues.req';
import type { Issue, IssueCreatedResponse } from './res/issues.res';

export async function getIssues(): Promise<Issue[]> {
  const { data } = await apiClient.get<Issue[]>(`${API_PREFIXES.inventory}/issues`);
  return data;
}

export async function createIssue(request: IssueRequest): Promise<IssueCreatedResponse> {
  const { data } = await apiClient.post<IssueCreatedResponse>(`${API_PREFIXES.inventory}/issues`, request);
  return data;
}
