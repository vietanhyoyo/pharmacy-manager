'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { RefreshCw, Search } from 'lucide-react';
import { EditorDialog } from '@/components/customs/dialogs/editor-dialog';
import { PageError, PageLoading } from '@/components/admin/page-feedback';
import { PageHeader } from '@/components/admin/page-header';
import { AppTable, number } from '@/components/customs/tables/app-table';
import { InventoryDataRow, InventoryMobileRow } from '@/components/customs/tables/app-table-rows';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import type { Lot } from '@/lib/api/res/lots.res';
import { invalidateInventoryApiStates } from '@/lib/state/inventory-api-state';
import { lookupsApiState } from '@/lib/state/lookups-api-state';
import { lotsApiState } from '@/lib/state/lots-api-state';
import { useAdminStore } from '@/lib/store';

type LotEditor = { section: 'lots'; item?: Lot } | null;
const headers = ['Thuốc', 'Số lô', 'Hạn dùng', { label: 'Tồn kho', align: 'right' as const }, 'Trạng thái', { label: '', className: 'w-14' }];

export default function LotsPage() {
  const resource = useStore(lotsApiState.store, state => state);
  const warehouseId = useAdminStore(state => state.selectedWarehouseId);
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<LotEditor>(null);

  useEffect(() => {
    if (warehouseId) void lotsApiState.load(warehouseId).catch(() => undefined);
  }, [warehouseId]);

  function reloadLots() {
    if (warehouseId) void lotsApiState.load(warehouseId).catch(() => undefined);
  }

  const rows = useMemo(() => (resource.data ?? []).filter(row =>
    JSON.stringify(row).toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')),
  ), [resource.data, search]);

  function onSaved() {
    setEditor(null);
    invalidateInventoryApiStates('lots');
    reloadLots();
    void lookupsApiState.load(undefined).catch(() => undefined);
  }

  return (
    <>
      <PageHeader section="lots" onAction={() => setEditor({ section: 'lots' })} />
      {resource.error && <PageError message={resource.error} onRetry={reloadLots} />}
      {resource.data === null && resource.isFetching ? <PageLoading /> : resource.data === null ? null : (
        <Card className="gap-0">
          <CardHeader className="border-b pb-4">
            <CardTitle>Danh sách lô hàng</CardTitle>
            <CardDescription>Theo dõi số lô, hạn dùng và lượng thuốc theo từng đợt</CardDescription>
            <CardAction><span className="text-sm font-medium text-muted-foreground">{number(rows.length)} mục</span></CardAction>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <InputGroup className="max-w-md"><InputGroupAddon><Search className="size-4" /></InputGroupAddon><InputGroupInput aria-label="Tìm kiếm lô hàng" placeholder="Tìm thuốc, mã lô hoặc hạn dùng..." value={search} onChange={event => setSearch(event.target.value)} /></InputGroup>
              <Button variant="outline" onClick={reloadLots} disabled={resource.isFetching}><RefreshCw className={resource.isFetching ? 'animate-spin' : undefined} />{resource.isFetching ? 'Đang cập nhật' : 'Làm mới'}</Button>
            </div>
            <AppTable key={`lots:${search}`} headers={headers} rows={rows} renderRow={item => <InventoryDataRow section="lots" item={item} onEdit={row => setEditor({ section: 'lots', item: row as Lot })} />} renderMobileRow={item => <InventoryMobileRow section="lots" item={item} onEdit={row => setEditor({ section: 'lots', item: row as Lot })} />} />
          </CardContent>
        </Card>
      )}
      <EditorDialog key={`lots-${editor?.item?.id || 'new'}`} editor={editor} onClose={() => setEditor(null)} onSaved={onSaved} />
    </>
  );
}
