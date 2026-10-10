'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { apiError } from '@/services/api_client';
import { trackOrder } from '@/services/modules/orders.service';
import { money } from '@/lib/format';

const labels: Record<string, string> = { PLACED: 'Chờ nhà thuốc xác nhận', PROCESSING: 'Nhà thuốc đang xử lý', CONFIRMED: 'Đã xác nhận, đang chuẩn bị hàng', SHIPPED: 'Đang giao hàng', COMPLETED: 'Đã giao thành công', CANCELLED: 'Đã hủy' };
type Tracking = Awaited<ReturnType<typeof trackOrder>>;

function OrderStatusContent() {
  const params = useSearchParams();
  const [number, setNumber] = useState(params.get('number') ?? '');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<Tracking | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setResult(null);
    try { setResult(await trackOrder(number.trim(), phone.trim())); }
    catch (cause) { setError(apiError(cause)); }
    finally { setBusy(false); }
  }

  return <main className="mx-auto min-h-[60vh] max-w-xl px-5 py-12 lg:py-20"><Link href="/" className="text-sm text-primary hover:underline">← Trang chủ</Link><h1 className="mt-6 text-3xl font-semibold">Tra cứu đơn hàng</h1><p className="mt-2 text-sm text-muted-foreground">Nhập mã đơn và số điện thoại người nhận để xem tiến độ.</p><Card className="mt-8"><CardHeader><CardTitle>Thông tin tra cứu</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-5"><div className="space-y-2"><Label htmlFor="order-number">Mã đơn hàng</Label><Input id="order-number" value={number} onChange={event => setNumber(event.target.value)} required maxLength={64} placeholder="WEB-YYYYMMDD-XXXXXXXX" /></div><div className="space-y-2"><Label htmlFor="order-phone">Số điện thoại người nhận</Label><Input id="order-phone" value={phone} onChange={event => setPhone(event.target.value)} required maxLength={32} type="tel" /></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button disabled={busy} type="submit" className="w-full">{busy ? 'Đang tra cứu...' : 'Xem trạng thái'}</Button></form></CardContent></Card>{result && <Card className="mt-6"><CardHeader><CardTitle>Đơn {result.orderNumber}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><Badge variant="secondary">{labels[result.status] ?? result.status}</Badge><p>Chi nhánh: <strong>{result.branchName}</strong></p><p>Ngày đặt: {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(result.placedAt))}</p><p>Tổng tiền: <strong>{money(result.total)}</strong></p><p>Thanh toán: {result.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Thanh toán khi nhận hàng'}</p></CardContent></Card>}</main>;
}

export default function OrderStatusPage() {
  return <Suspense fallback={<main className="mx-auto max-w-xl px-5 py-20">Đang tải...</main>}><OrderStatusContent /></Suspense>;
}
