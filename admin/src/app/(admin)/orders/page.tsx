'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { RefreshCw, Search } from 'lucide-react';
import { PageError, PageLoading } from '@/components/admin/page-feedback';
import { PageHeader } from '@/components/admin/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { updateOrder } from '@/lib/api/orders.api';
import type { OrderAction, OrderListQuery } from '@/lib/api/req/orders.req';
import { orderBranchesApiState, orderDetailApiState, ordersApiState } from '@/lib/state/orders-api-state';
import { stockApiState } from '@/lib/state/stock-api-state';
import { productsApiState } from '@/lib/state/products-api-state';
import { movementsApiState } from '@/lib/state/movements-api-state';
import { dashboardApiState } from '@/lib/state/dashboard-api-state';

const statusLabels: Record<string, string> = { PLACED: 'Chờ xác nhận', PROCESSING: 'Đang xử lý', CONFIRMED: 'Đã giữ hàng', SHIPPED: 'Đang giao', COMPLETED: 'Hoàn tất', CANCELLED: 'Đã hủy' };
const actionLabels: Record<OrderAction, string> = { confirm: 'Xác nhận và giữ hàng', dispatch: 'Xuất kho và giao hàng', complete: 'Đã giao và thu tiền', cancel: 'Hủy đơn' };
const money = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const date = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value));

export default function OrdersPage() {
  const orders = useStore(ordersApiState.store, state => state);
  const branches = useStore(orderBranchesApiState.store, state => state);
  const detail = useStore(orderDetailApiState.store, state => state);
  const [branchId, setBranchId] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => { void orderBranchesApiState.load(undefined).catch(() => undefined); }, []);
  useEffect(() => { const timer = setTimeout(() => setDebounced(search.trim()), 300); return () => clearTimeout(timer); }, [search]);
  const query = useMemo<OrderListQuery>(() => ({ branchId: branchId || undefined, status: status || undefined, search: debounced || undefined, page }), [branchId, status, debounced, page]);
  useEffect(() => { void ordersApiState.load(query).catch(() => undefined); }, [query]);
  useEffect(() => { if (selectedId) void orderDetailApiState.load(selectedId).catch(() => undefined); }, [selectedId]);
  const reload = () => { void ordersApiState.load(query).catch(() => undefined); };
  const selected = detail.key === selectedId ? detail.data : null;

  async function perform(action: OrderAction) {
    if (!selectedId || busy) return;
    setBusy(true); setActionError('');
    try {
      await updateOrder(selectedId, action);
      orderDetailApiState.invalidate();
      ordersApiState.invalidate();
      void orderDetailApiState.load(selectedId).catch(() => undefined);
      void ordersApiState.load(query).catch(() => undefined);
      if (action === 'confirm' || action === 'dispatch' || action === 'cancel') {
        stockApiState.invalidate(); productsApiState.invalidate(); dashboardApiState.invalidate();
        if (action === 'dispatch') movementsApiState.invalidate();
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Không thể xử lý đơn hàng');
      orderDetailApiState.invalidate(); ordersApiState.invalidate();
      void orderDetailApiState.load(selectedId).catch(() => undefined);
      void ordersApiState.load(query).catch(() => undefined);
    }
    finally { setBusy(false); }
  }

  return <>
    <PageHeader section="orders" />
    {orders.error && <PageError message={orders.error} onRetry={reload} />}
    {branches.error && <PageError message={branches.error} onRetry={() => { void orderBranchesApiState.load(undefined).catch(() => undefined); }} />}
    <Card className="gap-0">
      <CardHeader className="border-b"><CardTitle>Danh sách đơn hàng</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="grid gap-3 border-b p-4 sm:grid-cols-2 lg:grid-cols-[1fr_230px_190px_auto]">
          <InputGroup><InputGroupAddon><Search className="size-4" /></InputGroupAddon><InputGroupInput aria-label="Tìm đơn hàng" placeholder="Mã đơn, tên hoặc số điện thoại..." value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></InputGroup>
          <Select items={[{ value: 'all', label: 'Tất cả chi nhánh' }, ...(branches.data ?? []).map(branch => ({ value: branch.id, label: branch.name }))]} value={branchId || 'all'} onValueChange={value => { setBranchId(value === 'all' ? '' : value ?? ''); setPage(1); }}><SelectTrigger aria-label="Lọc theo chi nhánh" className="w-full"><SelectValue placeholder="Chi nhánh" /></SelectTrigger><SelectContent alignItemWithTrigger={false}><SelectItem value="all">Tất cả chi nhánh</SelectItem>{branches.data?.map(branch => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}</SelectContent></Select>
          <Select items={[{ value: 'all', label: 'Mọi trạng thái' }, ...Object.entries(statusLabels).map(([value, label]) => ({ value, label }))]} value={status || 'all'} onValueChange={value => { setStatus(value === 'all' ? '' : value ?? ''); setPage(1); }}><SelectTrigger aria-label="Lọc theo trạng thái" className="w-full"><SelectValue placeholder="Trạng thái" /></SelectTrigger><SelectContent alignItemWithTrigger={false}><SelectItem value="all">Mọi trạng thái</SelectItem>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
          <Button variant="outline" onClick={reload} disabled={orders.isFetching}><RefreshCw className={orders.isFetching ? 'animate-spin' : undefined} />Làm mới</Button>
        </div>
        {orders.data === null && orders.isFetching ? <PageLoading /> : orders.data?.items.length ? <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Mã đơn</TableHead><TableHead>Chi nhánh</TableHead><TableHead>Khách hàng</TableHead><TableHead>Đặt lúc</TableHead><TableHead>Trạng thái</TableHead><TableHead className="text-right">Tổng tiền</TableHead><TableHead /></TableRow></TableHeader><TableBody>{orders.data.items.map(order => <TableRow key={order.id}><TableCell className="font-medium">{order.orderNumber}</TableCell><TableCell>{order.branchName}</TableCell><TableCell>{order.recipientName}<span className="block text-xs text-muted-foreground">{order.recipientPhone}</span></TableCell><TableCell>{date(order.placedAt)}</TableCell><TableCell><Badge variant={order.status === 'CANCELLED' ? 'destructive' : order.status === 'COMPLETED' ? 'default' : 'secondary'}>{statusLabels[order.status] ?? order.status}</Badge></TableCell><TableCell className="text-right font-medium">{money(order.total)}</TableCell><TableCell><Button variant="outline" size="sm" onClick={() => { setSelectedId(order.id); setActionError(''); }}>Xem chi tiết</Button></TableCell></TableRow>)}</TableBody></Table></div> : <p className="p-10 text-center text-sm text-muted-foreground">Chưa có đơn hàng phù hợp.</p>}
        {(orders.data?.totalPages ?? 0) > 1 && <div className="flex items-center justify-end gap-3 border-t p-4"><Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</Button><span className="text-sm">Trang {page}/{orders.data?.totalPages}</span><Button variant="outline" disabled={page >= (orders.data?.totalPages ?? 0)} onClick={() => setPage(page + 1)}>Sau</Button></div>}
      </CardContent>
    </Card>
    <Dialog open={!!selectedId} onOpenChange={open => { if (!open) setSelectedId(null); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Đơn hàng {selected?.orderNumber ?? ''}</DialogTitle><DialogDescription>Chi tiết, lịch sử xử lý và giao hàng</DialogDescription></DialogHeader>{detail.error && <PageError message={detail.error} onRetry={() => { if (selectedId) void orderDetailApiState.load(selectedId).catch(() => undefined); }} />}{!selected ? <p className="py-8 text-sm text-muted-foreground">Đang tải chi tiết...</p> : <div className="space-y-5 text-sm">
      <div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{statusLabels[selected.status] ?? selected.status}</Badge><Badge variant="outline">{selected.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Thanh toán khi nhận'}</Badge><span className="text-muted-foreground">{date(selected.placedAt)}</span></div>
      <div className="grid gap-2 rounded-lg bg-muted p-4 sm:grid-cols-2"><p><strong>Chi nhánh:</strong> {selected.branchName}</p><p><strong>Người nhận:</strong> {selected.recipientName}</p><p><strong>Điện thoại:</strong> {selected.recipientPhone}</p><p className="sm:col-span-2"><strong>Địa chỉ:</strong> {selected.address}</p></div>
      <div><h3 className="mb-2 font-semibold">Sản phẩm</h3><div className="divide-y rounded-lg border">{selected.lines.map(line => <div key={line.id} className="flex justify-between gap-3 p-3"><span>{line.name} <span className="text-muted-foreground">({line.sku}) · {line.quantity} {line.unit}</span></span><span className="shrink-0 font-medium">{money(line.total)}</span></div>)}</div><p className="mt-3 text-right text-lg font-semibold">Tổng cộng: {money(selected.total)}</p></div>
      <div><h3 className="mb-2 font-semibold">Lịch sử</h3><div className="space-y-1 text-muted-foreground">{selected.events.map(event => <p key={event.id}>{date(event.createdAt)} · {statusLabels[event.toStatus] ?? event.toStatus}</p>)}</div></div>
      {actionError && <p role="alert" className="text-destructive">{actionError}</p>}
      <div className="flex flex-wrap justify-end gap-2 border-t pt-4">{selected.status === 'PLACED' && <Button disabled={busy} onClick={() => { void perform('confirm'); }}>{actionLabels.confirm}</Button>}{selected.status === 'CONFIRMED' && <Button disabled={busy} onClick={() => { void perform('dispatch'); }}>{actionLabels.dispatch}</Button>}{selected.status === 'SHIPPED' && <Button disabled={busy} onClick={() => { void perform('complete'); }}>{actionLabels.complete}</Button>}{['PLACED', 'CONFIRMED'].includes(selected.status) && <Button variant="destructive" disabled={busy} onClick={() => { void perform('cancel'); }}>{actionLabels.cancel}</Button>}{selected.status === 'PROCESSING' && selected.pendingAction && <Button disabled={busy} onClick={() => { void perform(selected.pendingAction!); }}>Tiếp tục: {actionLabels[selected.pendingAction]}</Button>}</div>
    </div>}</DialogContent></Dialog>
  </>;
}
