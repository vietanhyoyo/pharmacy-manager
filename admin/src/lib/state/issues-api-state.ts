import { getIssues } from '@/lib/api/issues.api';
import type { Issue } from '@/lib/api/res/issues.res';
import { LocalApiState } from './local-api-state';

export class IssuesApiState extends LocalApiState<Issue[], void> {
  constructor() {
    super(() => getIssues(), () => 'all');
  }
}

export const issuesApiState = new IssuesApiState();
