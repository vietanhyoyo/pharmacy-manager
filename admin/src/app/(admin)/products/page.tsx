'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { RefreshCw, RotateCcw, Search } from 'lucide-react';
import { EditorDialog } from '@/components/customs/dialogs/editor-dialog';
import { PageError, PageLoading } from '@/components/admin/page-feedback';
import { PageHeader } from '@/components/admin/page-header';
import { AppTable, number } from '@/components/customs/tables/app-table';
import { InventoryDataRow, InventoryMobileRow } from '@/components/customs/tables/app-table-rows';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProductListQuery } from '@/lib/api/req/products.req';
import type { Product } from '@/lib/api/res/products.res';
import { invalidateInventoryApiStates } from '@/lib/state/inventory-api-state';
import { lookupsApiState } from '@/lib/state/lookups-api-state';
import { productsApiState } from '@/lib/state/products-api-state';
import { useAdminStore } from '@/lib/store';

type ProductEditor = { section: 'products'; item?: Product } | null;
const headers = [
  { label: 'Thuốc', className: 'w-[30%]' },
  { label: 'Nhóm / dạng', className: 'w-[23%]' },
  { label: 'Đơn vị', className: 'w-[10%]' },
  { label: 'Tồn kho', align: 'right' as const, className: 'w-[11%]' },
  { label: 'Trạng thái', className: 'w-[18%]' },
  { label: '', className: 'w-[8%]' },
];

export default function ProductsPage() {
  const resource = useStore(productsApiState.store, state => state);
  const categories = useStore(lookupsApiState.store, state => state.data?.categories);
  const warehouseId = useAdminStore(state => state.selectedWarehouseId);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('');
  const [prescriptionType, setPrescriptionType] = useState('');
  const [sort, setSort] = useState('name:asc');
  const [editor, setEditor] = useState<ProductEditor>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const query = useMemo<ProductListQuery>(() => {
    const [sortBy, sortOrder] = sort.split(':') as [ProductListQuery['sortBy'], ProductListQuery['sortOrder']];
    return {
      search: debouncedSearch || undefined,
      warehouseId: warehouseId ?? undefined,
      categoryId: categoryId || undefined,
      status: (status || undefined) as ProductListQuery['status'],
      prescriptionType: (prescriptionType || undefined) as ProductListQuery['prescriptionType'],
      sortBy,
      sortOrder,
    };
  }, [categoryId, debouncedSearch, prescriptionType, sort, status, warehouseId]);
  const queryKey = JSON.stringify(query);

  useEffect(() => {
    if (warehouseId) void productsApiState.load(query).catch(() => undefined);
  }, [query, warehouseId]);

  function reloadProducts() {
    if (warehouseId) void productsApiState.load(query).catch(() => undefined);
  }

  function onSaved() {
    setEditor(null);
    invalidateInventoryApiStates('products');
    reloadProducts();
    void lookupsApiState.load(undefined).catch(() => undefined);
  }

  function resetFilters() {
    setSearch('');
    setCategoryId('');
    setStatus('');
    setPrescriptionType('');
    setSort('name:asc');
  }

  const hasFilters = !!(search.trim() || categoryId || status || prescriptionType || sort !== 'name:asc');
  const rows = resource.data ?? [];

  return (
    <>
      <PageHeader section="products" onAction={() => setEditor({ section: 'products' })} />
      {resource.error && <PageError message={resource.error} onRetry={reloadProducts} />}
      {resource.data === null && resource.isFetching ? <PageLoading /> : resource.data === null ? null : (
        <Card className="gap-0">
          <CardHeader className="border-b pb-4">
            <CardTitle>Danh sách thuốc</CardTitle>
            <CardDescription>Tra cứu và theo dõi dữ liệu trong kho thuốc</CardDescription>
            <CardAction><Badge variant="secondary">{number(rows.length)} mục</Badge></CardAction>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <InputGroup className="max-w-md">
                <InputGroupAddon><Search className="size-4" /></InputGroupAddon>
                <InputGroupInput aria-label="Tìm thuốc theo tên, mã hoặc hoạt chất" placeholder="Tên thuốc, mã thuốc, hoạt chất..." value={search} onChange={event => setSearch(event.target.value)} />
              </InputGroup>
              <Button variant="outline" onClick={reloadProducts} disabled={resource.isFetching}><RefreshCw className={resource.isFetching ? 'animate-spin' : undefined} />{resource.isFetching ? 'Đang cập nhật' : 'Làm mới'}</Button>
            </div>
            <div className="grid gap-3 border-b px-4 py-4 sm:grid-cols-2 xl:grid-cols-4">
              <Select items={[{ value: 'all', label: 'Tất cả nhóm thuốc' }, ...(categories ?? []).map(category => ({ value: category.id, label: category.name }))]} value={categoryId || 'all'} onValueChange={value => setCategoryId(value === 'all' ? '' : value ?? '')}>
                <SelectTrigger aria-label="Lọc theo nhóm thuốc" className="w-full"><SelectValue placeholder="Nhóm thuốc" /></SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="all">Tất cả nhóm thuốc</SelectItem>
                  {categories?.map(category => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select items={[{ value: 'all', label: 'Mọi trạng thái' }, { value: 'ACTIVE', label: 'Đang hoạt động' }, { value: 'INACTIVE', label: 'Ngừng hoạt động' }]} value={status || 'all'} onValueChange={value => setStatus(value === 'all' ? '' : value ?? '')}>
                <SelectTrigger aria-label="Lọc theo trạng thái" className="w-full"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="all">Mọi trạng thái</SelectItem>
                  <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
              <Select items={[{ value: 'all', label: 'Mọi loại kê đơn' }, { value: 'RX', label: 'Thuốc kê đơn' }, { value: 'OTC', label: 'Thuốc không kê đơn' }, { value: 'OTHER', label: 'Loại khác' }]} value={prescriptionType || 'all'} onValueChange={value => setPrescriptionType(value === 'all' ? '' : value ?? '')}>
                <SelectTrigger aria-label="Lọc theo loại kê đơn" className="w-full"><SelectValue placeholder="Loại kê đơn" /></SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="all">Mọi loại kê đơn</SelectItem>
                  <SelectItem value="RX">Thuốc kê đơn</SelectItem>
                  <SelectItem value="OTC">Thuốc không kê đơn</SelectItem>
                  <SelectItem value="OTHER">Loại khác</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Select items={[{ value: 'name:asc', label: 'Tên thuốc: A–Z' }, { value: 'name:desc', label: 'Tên thuốc: Z–A' }, { value: 'sku:asc', label: 'Mã thuốc: A–Z' }, { value: 'sku:desc', label: 'Mã thuốc: Z–A' }, { value: 'createdAt:desc', label: 'Mới tạo trước' }, { value: 'createdAt:asc', label: 'Cũ nhất' }]} value={sort} onValueChange={value => setSort(value ?? 'name:asc')}>
                  <SelectTrigger aria-label="Sắp xếp danh sách thuốc" className="w-full"><SelectValue placeholder="Sắp xếp" /></SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectItem value="name:asc">Tên thuốc: A–Z</SelectItem>
                    <SelectItem value="name:desc">Tên thuốc: Z–A</SelectItem>
                    <SelectItem value="sku:asc">Mã thuốc: A–Z</SelectItem>
                    <SelectItem value="sku:desc">Mã thuốc: Z–A</SelectItem>
                    <SelectItem value="createdAt:desc">Mới tạo trước</SelectItem>
                    <SelectItem value="createdAt:asc">Cũ nhất</SelectItem>
                  </SelectContent>
                </Select>
                {hasFilters && <Button type="button" variant="outline" aria-label="Xóa bộ lọc" title="Xóa bộ lọc" onClick={resetFilters}><RotateCcw className="size-4" /><span className="sr-only sm:not-sr-only">Xóa lọc</span></Button>}
              </div>
            </div>
            <AppTable key={queryKey} headers={headers} rows={rows} tableClassName="min-w-[800px] table-fixed" renderRow={item => <InventoryDataRow section="products" item={item} onEdit={row => setEditor({ section: 'products', item: row as Product })} />} renderMobileRow={item => <InventoryMobileRow section="products" item={item} onEdit={row => setEditor({ section: 'products', item: row as Product })} />} />
          </CardContent>
        </Card>
      )}
      <EditorDialog key={`products-${editor?.item?.id || 'new'}`} editor={editor} onClose={() => setEditor(null)} onSaved={onSaved} />
    </>
  );
}
