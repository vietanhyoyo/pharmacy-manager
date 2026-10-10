"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/components/custom/cart-provider';
import { money } from '@/lib/format';
import { apiError } from '@/services/api_client';
import { createOrder } from '@/services/modules/orders.service';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, ready, clear } = useCart();
  const requestKey = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !items.length) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const phone = String(form.get('phone') ?? '').trim();
    const address = String(form.get('address') ?? '').trim();
    const ward = String(form.get('ward') ?? '').trim();
    const district = String(form.get('district') ?? '').trim();
    const province = String(form.get('province') ?? '').trim();
    if (!name || !phone || !address || !province) { setError('Vui lòng nhập đầy đủ thông tin nhận hàng.'); return; }
    setBusy(true); setError('');
    requestKey.current ??= crypto.randomUUID();
    try {
      const order = await createOrder({ idempotencyKey: requestKey.current, customer: { name, phone }, delivery: { address, ward, district, province }, items: items.map(item => ({ productId: item.productId, productUnitId: item.productUnitId, quantity: item.quantity })) });
      clear();
      router.replace(`/order-success?number=${encodeURIComponent(order.orderNumber)}&total=${order.total}`);
    } catch (caught) { setError(apiError(caught)); }
    finally { setBusy(false); }
  }

  return <main className="mx-auto min-h-[60vh] max-w-6xl px-5 py-12 lg:px-8"><Link href="/cart" className="inline-flex items-center gap-2 text-sm font-medium text-[#43825f] hover:underline"><ArrowLeft className="size-4" /> Quay lại giỏ hàng</Link><div className="mt-8"><span className="text-xs font-bold uppercase tracking-[.2em] text-[#3b9169]">Bước cuối cùng</span><h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#183f30]">Thông tin đặt hàng</h1></div>
    {!ready ? <Card className="mt-9 rounded-3xl border-[#e0e9e1] bg-white p-10 py-10">Đang tải giỏ hàng...</Card> : !items.length ? <Card className="mt-9 rounded-3xl border-[#e0e9e1] bg-white p-10 py-10 text-[#667e6e]">Giỏ hàng đang trống. <Link className="font-semibold text-[#1d7658] underline" href="/products">Xem sản phẩm</Link></Card> : <form onSubmit={submit} className="mt-9 grid gap-8 lg:grid-cols-[1fr_340px]">
      <Card className="rounded-[1.75rem] border-[#e0e9e1] bg-white py-0"><CardHeader className="p-7 pb-0 md:p-9 md:pb-0"><CardTitle className="text-xl font-semibold text-[#224a35]">Thông tin người nhận</CardTitle></CardHeader><CardContent className="p-7 pt-7 md:p-9 md:pt-7"><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="name">Họ và tên *</Label><Input id="name" name="name" required maxLength={255} placeholder="Nguyễn Văn A" className="h-12" /></div><div className="space-y-2"><Label htmlFor="phone">Số điện thoại *</Label><Input id="phone" name="phone" required maxLength={32} type="tel" placeholder="090 123 4567" className="h-12" /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="address">Địa chỉ nhận hàng *</Label><Input id="address" name="address" required maxLength={500} placeholder="Số nhà, tên đường" className="h-12" /></div><div className="space-y-2"><Label htmlFor="ward">Phường / Xã</Label><Input id="ward" name="ward" maxLength={128} placeholder="Phường Bến Nghé" className="h-12" /></div><div className="space-y-2"><Label htmlFor="district">Quận / Huyện</Label><Input id="district" name="district" maxLength={128} placeholder="Quận 1" className="h-12" /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="province">Tỉnh / Thành phố *</Label><Input id="province" name="province" required maxLength={128} placeholder="TP. Hồ Chí Minh" className="h-12" /></div></div><div className="mt-8 rounded-2xl bg-[#f0f6ef] p-5 text-sm leading-6 text-[#58725e]"><strong className="text-[#245840]">Thanh toán khi nhận hàng.</strong> Nhà thuốc sẽ liên hệ xác nhận đơn và thông tin giao hàng. Sản phẩm không kê đơn vẫn cần sử dụng đúng hướng dẫn.</div>{error && <Alert variant="destructive" className="mt-5 border-[#eec9bb] bg-[#fff5f0] text-[#a34d38]"><AlertDescription>{error}</AlertDescription></Alert>}</CardContent></Card>
      <Card className="h-fit rounded-[1.75rem] border-[#dce9de] bg-[#f0f6ef] py-0"><CardHeader className="p-7 pb-0"><CardTitle className="text-xl font-semibold text-[#1c4d36]">Đơn hàng của bạn</CardTitle></CardHeader><CardContent className="p-7 pt-6"><div className="space-y-4">{items.map(item => <div key={item.productUnitId} className="flex justify-between gap-4 text-sm"><span className="text-[#5d7562]">{item.name} <span className="whitespace-nowrap">× {item.quantity}</span></span><span className="shrink-0 font-medium">{money(item.price * item.quantity)}</span></div>)}</div><Separator className="my-6 bg-[#d8e6da]" /><div className="flex justify-between text-lg font-bold text-[#1c4d36]"><span>Tạm tính</span><span>{money(subtotal)}</span></div><p className="mt-2 text-xs text-[#7d917f]">Giá cuối cùng được tính lại tại nhà thuốc.</p><Button disabled={busy} type="submit" className="mt-6 h-12 w-full rounded-xl bg-[#1d7658] hover:bg-[#16583f]"><LockKeyhole className="size-4" />{busy ? 'Đang gửi đơn...' : 'Gửi yêu cầu đặt hàng'}</Button><p className="mt-4 text-center text-xs leading-5 text-[#829383]">Bằng cách gửi đơn, bạn đồng ý để nhà thuốc liên hệ xác nhận.</p></CardContent></Card>
    </form>}
  </main>;
}
