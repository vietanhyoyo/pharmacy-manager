'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { RefreshCw, Search } from 'lucide-react';
import { PageError, PageLoading } from '@/components/admin/page-feedback';
import { PageHeader } from '@/components/admin/page-header';
import { AppTable, number } from '@/components/customs/tables/app-table';
import { InventoryDataRow, InventoryMobileRow } from '@/components/customs/tables/app-table-rows';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { movementsApiState } from '@/lib/state/movements-api-state';
import { useAdminStore } from '@/lib/store';

const headers = ['Thời gian', 'Thuốc / lô', 'Loại biến động', { label: 'Số lượng', align: 'right' as const }, 'Mã chứng từ'];

export default function MovementsPage() {
  const resource = useStore(movementsApiState.store, state => state);
  const warehouseId = useAdminStore(state => state.selectedWarehouseId);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (warehouseId) void movementsApiState.load(warehouseId).catch(() => undefined);
  }, [warehouseId]);

  function reloadMovements() {
    if (warehouseId) void movementsApiState.load(warehouseId).catch(() => undefined);
  }

  const rows = useMemo(() => (resource.data ?? []).filter(row =>
    JSON.stringify(row).toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')),
  ), [resource.data, search]);

  return (
    <>
      <PageHeader section="movements" />
      {resource.error && <PageError message={resource.error} onRetry={reloadMovements} />}
      {resource.data === null && resource.isFetching ? <PageLoading /> : resource.data === null ? null : (
        <Card className="gap-0">
          <CardHeader className="border-b pb-4">
            <CardTitle>Các lần biến động kho</CardTitle>
            <CardDescription>Nhật ký biến động số lượng của tất cả thuốc</CardDescription>
            <CardAction><span className="text-sm font-medium text-muted-foreground">{number(rows.length)} mục</span></CardAction>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <InputGroup className="max-w-md"><InputGroupAddon><Search className="size-4" /></InputGroupAddon><InputGroupInput aria-label="Tìm lịch sử kho" placeholder="Thuốc, mã lô hoặc mã chứng từ..." value={search} onChange={event => setSearch(event.target.value)} /></InputGroup>
              <Button variant="outline" onClick={reloadMovements} disabled={resource.isFetching}><RefreshCw className={resource.isFetching ? 'animate-spin' : undefined} />{resource.isFetching ? 'Đang cập nhật' : 'Làm mới'}</Button>
            </div>
            <AppTable key={`movements:${search}`} headers={headers} rows={rows} renderRow={item => <InventoryDataRow section="movements" item={item} onEdit={() => undefined} />} renderMobileRow={item => <InventoryMobileRow section="movements" item={item} onEdit={() => undefined} />} />
          </CardContent>
        </Card>
      )}
    </>
  );
}
