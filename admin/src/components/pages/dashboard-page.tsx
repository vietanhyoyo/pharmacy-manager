'use client';

import { useEffect, useState } from 'react';
import { PageError, PageLoading } from '@/components/admin/page-feedback';
import { PageHeader } from '@/components/admin/page-header';
import { DashboardView } from './dashboard-view';
import { getDashboard } from '@/lib/api/dashboard.api';
import type { Dashboard } from '@/lib/api/res/inventory.res';
import { useAdminStore } from '@/lib/store';

export function DashboardPage() {
  const revision = useAdminStore(state => state.revision);
  const refresh = useAdminStore(state => state.refresh);
  const [loaded, setLoaded] = useState<{ revision: number; data: Dashboard | null; error: string } | null>(null);
  const loading = loaded?.revision !== revision;

  useEffect(() => {
    let active = true;
    getDashboard()
      .then(data => { if (active) setLoaded({ revision, data, error: '' }); })
      .catch(cause => { if (active) setLoaded({ revision, data: null, error: cause instanceof Error ? cause.message : 'Không tải được tổng quan' }); });
    return () => { active = false; };
  }, [revision]);

  return <>
    <PageHeader section="dashboard" />
    {!loading && loaded?.error && <PageError message={loaded.error} onRetry={refresh} />}
    {loading ? <PageLoading /> : loaded?.data ? <DashboardView data={loaded.data} onEdit={() => {}} /> : null}
  </>;
}
