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
import { invalidateInventoryApiStates } from '@/lib/state/inventory-api-state';
import { lookupsApiState } from '@/lib/state/lookups-api-state';
import { receiptsApiState } from '@/lib/state/receipts-api-state';

type ReceiptEditor = { section: 'receipts' } | null;
const headers = ['Mã phiếu', 'Nhà cung cấp', 'Ngày nhập', { label: 'Số dòng', align: 'right' as const }, { label: 'Số lượng', align: 'right' as const }, { label: 'Giá trị', align: 'right' as const }, 'Trạng thái'];

export default function ReceiptsPage() {
  const resource = useStore(receiptsApiState.store, state => state);
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<ReceiptEditor>(null);

  useEffect(() => {
    void receiptsApiState.load(undefined).catch(() => undefined);
  }, []);

  function reloadReceipts() {
    void receiptsApiState.load(undefined).catch(() => undefined);
  }

  const rows = useMemo(() => (resource.data ?? []).filter(row =>
    JSON.stringify(row).toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')),
  ), [resource.data, search]);

  function onSaved() {
    setEditor(null);
    invalidateInventoryApiStates('receipts');
    reloadReceipts();
    void lookupsApiState.load(undefined).catch(() => undefined);
  }

  return (
    <>
      <PageHeader section="receipts" onAction={() => setEditor({ section: 'receipts' })} />
      {resource.error && <PageError message={resource.error} onRetry={reloadReceipts} />}
      {resource.data === null && resource.isFetching ? <PageLoading /> : resource.data === null ? null : (
        <Card className="gap-0">
          <CardHeader className="border-b pb-4">
            <CardTitle>Danh sách phiếu nhập</CardTitle>
            <CardDescription>Ghi nhận thuốc nhập từ các nhà cung cấp</CardDescription>
            <CardAction><span className="text-sm font-medium text-muted-foreground">{number(rows.length)} mục</span></CardAction>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <InputGroup className="max-w-md"><InputGroupAddon><Search className="size-4" /></InputGroupAddon><InputGroupInput aria-label="Tìm phiếu nhập" placeholder="Mã phiếu hoặc nhà cung cấp..." value={search} onChange={event => setSearch(event.target.value)} /></InputGroup>
              <Button variant="outline" onClick={reloadReceipts} disabled={resource.isFetching}><RefreshCw className={resource.isFetching ? 'animate-spin' : undefined} />{resource.isFetching ? 'Đang cập nhật' : 'Làm mới'}</Button>
            </div>
            <AppTable key={`receipts:${search}`} headers={headers} rows={rows} renderRow={item => <InventoryDataRow section="receipts" item={item} onEdit={() => undefined} />} renderMobileRow={item => <InventoryMobileRow section="receipts" item={item} onEdit={() => undefined} />} />
          </CardContent>
        </Card>
      )}
      <EditorDialog key="receipt-editor" editor={editor} onClose={() => setEditor(null)} onSaved={onSaved} />
    </>
  );
}
