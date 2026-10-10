import { getIssues } from '@/lib/api/issues.api';
import type { Issue } from '@/lib/api/res/issues.res';
import { LocalApiState } from './local-api-state';

export class IssuesApiState extends LocalApiState<Issue[], string> {
  constructor() {
    super(warehouseId => getIssues(warehouseId), warehouseId => `issues:${warehouseId}`);
  }
}

export const issuesApiState = new IssuesApiState();
