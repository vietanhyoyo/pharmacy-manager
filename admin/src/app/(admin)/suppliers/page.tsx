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
import type { Supplier } from '@/lib/api/res/suppliers.res';
import { invalidateInventoryApiStates } from '@/lib/state/inventory-api-state';
import { lookupsApiState } from '@/lib/state/lookups-api-state';
import { suppliersApiState } from '@/lib/state/suppliers-api-state';

type SupplierEditor = { section: 'suppliers'; item?: Supplier } | null;
const headers = ['Nhà cung cấp', 'Liên hệ', 'Trạng thái', { label: '', className: 'w-14' }];

export default function SuppliersPage() {
  const resource = useStore(suppliersApiState.store, state => state);
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<SupplierEditor>(null);

  useEffect(() => {
    void suppliersApiState.load(undefined).catch(() => undefined);
  }, []);

  function reloadSuppliers() {
    void suppliersApiState.load(undefined).catch(() => undefined);
  }

  const rows = useMemo(() => (resource.data ?? []).filter(row =>
    JSON.stringify(row).toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')),
  ), [resource.data, search]);

  function onSaved() {
    setEditor(null);
    invalidateInventoryApiStates('suppliers');
    reloadSuppliers();
    void lookupsApiState.load(undefined).catch(() => undefined);
  }

  return (
    <>
      <PageHeader section="suppliers" onAction={() => setEditor({ section: 'suppliers' })} />
      {resource.error && <PageError message={resource.error} onRetry={reloadSuppliers} />}
      {resource.data === null && resource.isFetching ? <PageLoading /> : resource.data === null ? null : (
        <Card className="gap-0">
          <CardHeader className="border-b pb-4">
            <CardTitle>Danh sách nhà cung cấp</CardTitle>
            <CardDescription>Danh sách đối tác cung cấp thuốc cho nhà thuốc</CardDescription>
            <CardAction><span className="text-sm font-medium text-muted-foreground">{number(rows.length)} mục</span></CardAction>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <InputGroup className="max-w-md"><InputGroupAddon><Search className="size-4" /></InputGroupAddon><InputGroupInput aria-label="Tìm nhà cung cấp" placeholder="Tên, mã hoặc số điện thoại..." value={search} onChange={event => setSearch(event.target.value)} /></InputGroup>
              <Button variant="outline" onClick={reloadSuppliers} disabled={resource.isFetching}><RefreshCw className={resource.isFetching ? 'animate-spin' : undefined} />{resource.isFetching ? 'Đang cập nhật' : 'Làm mới'}</Button>
            </div>
            <AppTable key={`suppliers:${search}`} headers={headers} rows={rows} tableClassName="min-w-[620px]" renderRow={item => <InventoryDataRow section="suppliers" item={item} onEdit={row => setEditor({ section: 'suppliers', item: row as Supplier })} />} renderMobileRow={item => <InventoryMobileRow section="suppliers" item={item} onEdit={row => setEditor({ section: 'suppliers', item: row as Supplier })} />} />
          </CardContent>
        </Card>
      )}
      <EditorDialog key={`suppliers-${editor?.item?.id || 'new'}`} editor={editor} onClose={() => setEditor(null)} onSaved={onSaved} />
    </>
  );
}
