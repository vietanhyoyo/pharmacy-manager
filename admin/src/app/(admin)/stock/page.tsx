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
import { stockApiState } from '@/lib/state/stock-api-state';

const headers = ['Thuốc', 'Lô / hạn dùng', 'Kho', { label: 'Tồn thực tế', align: 'right' as const }, { label: 'Khả dụng', align: 'right' as const }];

export default function StockPage() {
  const resource = useStore(stockApiState.store, state => state);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void stockApiState.load(undefined).catch(() => undefined);
  }, []);

  function reloadStock() {
    void stockApiState.load(undefined).catch(() => undefined);
  }

  const rows = useMemo(() => (resource.data ?? []).filter(row =>
    JSON.stringify(row).toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')),
  ), [resource.data, search]);

  return (
    <>
      <PageHeader section="stock" />
      {resource.error && <PageError message={resource.error} onRetry={reloadStock} />}
      {resource.data === null && resource.isFetching ? <PageLoading /> : resource.data === null ? null : (
        <Card className="gap-0">
          <CardHeader className="border-b pb-4">
            <CardTitle>Tồn kho theo lô</CardTitle>
            <CardDescription>Số lượng thực tế và khả dụng của từng lô trong kho</CardDescription>
            <CardAction><span className="text-sm font-medium text-muted-foreground">{number(rows.length)} mục</span></CardAction>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <InputGroup className="max-w-md"><InputGroupAddon><Search className="size-4" /></InputGroupAddon><InputGroupInput aria-label="Tìm kiếm tồn kho" placeholder="Tìm thuốc, mã lô hoặc kho..." value={search} onChange={event => setSearch(event.target.value)} /></InputGroup>
              <Button variant="outline" onClick={reloadStock} disabled={resource.isFetching}><RefreshCw className={resource.isFetching ? 'animate-spin' : undefined} />{resource.isFetching ? 'Đang cập nhật' : 'Làm mới'}</Button>
            </div>
            <AppTable key={`stock:${search}`} headers={headers} rows={rows} getRowKey={row => `${row.productId}-${row.lotId}`} renderRow={item => <InventoryDataRow section="stock" item={item} onEdit={() => undefined} />} renderMobileRow={item => <InventoryMobileRow section="stock" item={item} onEdit={() => undefined} />} />
          </CardContent>
        </Card>
      )}
    </>
  );
}
