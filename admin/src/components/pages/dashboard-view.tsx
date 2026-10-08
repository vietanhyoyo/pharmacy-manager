import Link from 'next/link';
import { ArrowRight, ClipboardList, Pill, Warehouse, Boxes } from 'lucide-react';
import { AppTable, EmptyState, formatDate, number } from '@/components/inventory-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Dashboard } from '@/lib/api/res/inventory.res';

export function DashboardView({ data, onEdit }: { data: Dashboard; onEdit: () => void }) {
  const cards = [
    { label: 'Tổng số thuốc', value: data.products, icon: Pill, hint: 'Sản phẩm trong danh mục' },
    { label: 'Tồn kho hiện tại', value: data.totalUnits, icon: Warehouse, hint: 'Đơn vị thuốc đang lưu kho' },
    { label: 'Lô hàng', value: data.lots, icon: Boxes, hint: 'Đang được theo dõi' },
    { label: 'Phiếu đã xử lý', value: Number(data.receipts) + Number(data.issues), icon: ClipboardList, hint: `${data.receipts} nhập · ${data.issues} xuất` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(card => <Card key={card.label} className="bg-card"><CardHeader><CardTitle className="text-sm text-muted-foreground">{card.label}</CardTitle><CardAction><span className="flex size-9 items-center justify-center rounded-lg border bg-muted/50"><card.icon className="size-4" /></span></CardAction></CardHeader><CardContent><div className="text-3xl font-semibold tracking-tight tabular-nums">{number(card.value)}</div><p className="mt-1 text-xs text-muted-foreground">{card.hint}</p></CardContent></Card>)}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card><CardHeader className="border-b"><CardTitle>Sắp hết hạn</CardTitle><CardDescription>Lô thuốc cần được chú ý trong 90 ngày tới</CardDescription><CardAction><Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/lots" />}>Xem tất cả <ArrowRight /></Button></CardAction></CardHeader><CardContent className="p-0">{data.expiring.length ? <div className="divide-y">{data.expiring.map(row => <div key={row.id} className="flex items-center justify-between gap-4 px-4 py-3.5"><div><div className="text-sm font-medium">{row.productName}</div><div className="mt-1 font-mono text-xs text-muted-foreground">{row.batchNumber} · {number(row.quantity)} đơn vị</div></div><Badge variant="secondary" className="h-auto rounded-md py-1.5">{formatDate(row.expiryDate)}</Badge></div>)}</div> : <EmptyState text="Không có lô sắp hết hạn" />}</CardContent></Card>
        <Card><CardHeader className="border-b"><CardTitle>Tồn kho thấp</CardTitle><CardDescription>Thuốc còn dưới 30 đơn vị</CardDescription><CardAction><Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/stock" />}>Xem tồn kho <ArrowRight /></Button></CardAction></CardHeader><CardContent className="p-0">{data.lowStock.length ? <div className="divide-y">{data.lowStock.map(row => <div key={row.id} className="flex items-center justify-between gap-4 px-4 py-3.5"><div><div className="text-sm font-medium">{row.name}</div><div className="mt-1 font-mono text-xs text-muted-foreground">{row.sku}</div></div><div className="text-sm font-semibold tabular-nums">{number(row.quantity)} <span className="text-xs font-normal text-muted-foreground">còn lại</span></div></div>)}</div> : <EmptyState text="Tồn kho đang ổn định" />}</CardContent></Card>
      </div>
      <Card><CardHeader className="border-b"><CardTitle>Biến động gần đây</CardTitle><CardDescription>Những lần nhập và xuất kho mới nhất</CardDescription><CardAction><Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/movements" />}>Xem lịch sử <ArrowRight /></Button></CardAction></CardHeader><CardContent className="p-0"><AppTable section="movements" rows={data.recent} onEdit={onEdit} compact /></CardContent></Card>
    </div>
  );
}
