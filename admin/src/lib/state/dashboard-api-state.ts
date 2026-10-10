import { getDashboard } from '@/lib/api/dashboard.api';
import type { Dashboard } from '@/lib/api/res/dashboard.res';
import { LocalApiState } from './local-api-state';

export class DashboardApiState extends LocalApiState<Dashboard, string> {
  constructor() {
    super(warehouseId => getDashboard(warehouseId), warehouseId => `dashboard:${warehouseId}`);
  }
}

export const dashboardApiState = new DashboardApiState();
