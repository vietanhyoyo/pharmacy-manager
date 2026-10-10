'use client';

import { useEffect } from 'react';
import { useStore } from 'zustand';
import { PageError, PageLoading } from '@/components/admin/page-feedback';
import { PageHeader } from '@/components/admin/page-header';
import { DashboardView } from './dashboard-view';
import { dashboardApiState } from '@/lib/state/dashboard-api-state';
import { useAdminStore } from '@/lib/store';

export function DashboardPage() {
  const resource = useStore(dashboardApiState.store, state => state);
  const warehouseId = useAdminStore(state => state.selectedWarehouseId);

  useEffect(() => {
    if (warehouseId) void dashboardApiState.load(warehouseId).catch(() => undefined);
  }, [warehouseId]);

  function reloadDashboard() {
    if (warehouseId) void dashboardApiState.load(warehouseId).catch(() => undefined);
  }

  return <>
    <PageHeader section="dashboard" />
    {resource.error && <PageError message={resource.error} onRetry={reloadDashboard} />}
    {resource.data === null && resource.isFetching ? <PageLoading /> : resource.data ? <DashboardView data={resource.data} onEdit={() => {}} /> : null}
  </>;
}
