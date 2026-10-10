import { getDashboard } from '@/lib/api/dashboard.api';
import type { Dashboard } from '@/lib/api/res/dashboard.res';
import { LocalApiState } from './local-api-state';

export class DashboardApiState extends LocalApiState<Dashboard, void> {
  constructor() {
    super(() => getDashboard(), () => 'dashboard');
  }
}

export const dashboardApiState = new DashboardApiState();
