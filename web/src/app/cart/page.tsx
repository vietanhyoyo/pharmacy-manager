"use client";

import Link from 'next/link';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/components/custom/cart-provider';
import { money } from '@/lib/format';

export default function CartPage() {
  const { items, ready, update, remove } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return <main className="mx-auto min-h-[60vh] max-w-7xl px-5 py-12 lg:px-8">
    <div className="mb-10"><span className="text-xs font-bold uppercase tracking-[.2em] text-[#3b9169]">Giỏ hàng của bạn</span><h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#183f30]">Sản phẩm đã chọn</h1></div>
    {!ready ? <Card className="rounded-3xl border-[#e2eae2] bg-white p-10 py-10 text-[#738776]">Đang tải giỏ hàng...</Card> : !items.length ? <Card className="items-center rounded-[2rem] border-[#e2eae2] bg-white px-5 py-20 text-center"><span className="flex size-20 items-center justify-center rounded-3xl bg-[#edf6ee] text-[#2d8a63]"><ShoppingBag className="size-10" /></span><h2 className="mt-7 text-2xl font-semibold">Giỏ hàng đang trống</h2><p className="mt-2 text-[#7c8c7d]">Cùng tìm sản phẩm phù hợp cho bạn nhé.</p><Button asChild className="mt-7 rounded-full bg-[#1d7658] hover:bg-[#16583f]"><Link href="/products">Khám phá sản phẩm <ArrowRight className="size-4" /></Link></Button></Card> : <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">{items.map(item => <Card key={item.productUnitId} className="rounded-3xl border-[#e2eae2] bg-white py-0"><CardContent className="flex flex-wrap items-center gap-5 p-5 sm:flex-nowrap"><div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-[#e8f2e9] text-3xl text-[#4c9870]">✚</div><div className="min-w-0 flex-1"><Link href={`/products/${item.slug}`} className="line-clamp-2 font-semibold text-[#214e38] hover:underline">{item.name}</Link><p className="mt-1 text-xs text-[#829386]">Đơn vị: {item.unitName}</p><p className="mt-2 text-sm font-semibold text-[#2b805d]">{money(item.price)}</p></div><div className="flex items-center gap-3"><ButtonGroup className="h-10 items-center rounded-xl border border-[#e0eae1] bg-white p-0.5"><Button type="button" variant="ghost" size="icon-lg" onClick={() => update(item.productUnitId, item.quantity - 1)} className="size-9 text-[#285b43]" aria-label="Giảm số lượng"><Minus className="size-4" /></Button><ButtonGroupText aria-live="polite" className="h-full w-7 justify-center rounded-none border-0 bg-transparent px-0 text-sm font-semibold">{item.quantity}</ButtonGroupText><Button type="button" variant="ghost" size="icon-lg" onClick={() => update(item.productUnitId, item.quantity + 1)} className="size-9 text-[#285b43]" aria-label="Tăng số lượng"><Plus className="size-4" /></Button></ButtonGroup><Button type="button" variant="ghost" size="icon-lg" onClick={() => remove(item.productUnitId)} className="rounded-full text-[#a87568] hover:bg-[#fff0ec] hover:text-[#a34d38]" aria-label={`Xóa ${item.name}`}><Trash2 className="size-4" /></Button></div></CardContent></Card>)}</div>
      <Card className="h-fit rounded-[1.75rem] border-[#dce9de] bg-[#f0f6ef] py-0"><CardHeader className="p-7 pb-0"><CardTitle className="text-xl font-semibold text-[#1c4d36]">Tóm tắt đơn hàng</CardTitle></CardHeader><CardContent className="p-7 pt-6"><div className="flex justify-between text-sm text-[#647c69]"><span>Tạm tính</span><span>{money(subtotal)}</span></div><div className="mt-3 flex justify-between text-sm text-[#647c69]"><span>Phí giao hàng</span><span>Miễn phí</span></div><Separator className="my-6 bg-[#d8e6da]" /><div className="flex justify-between text-lg font-bold text-[#1c4d36]"><span>Tổng cộng</span><span>{money(subtotal)}</span></div><p className="mt-4 text-xs leading-5 text-[#7d917f]">Giá và tồn kho sẽ được kiểm tra lại khi gửi yêu cầu đặt hàng.</p><Button asChild className="mt-6 h-12 w-full rounded-xl bg-[#1d7658] hover:bg-[#16583f]"><Link href="/checkout">Tiếp tục đặt hàng <ArrowRight className="size-4" /></Link></Button><Button asChild variant="link" className="mt-4 h-auto w-full text-sm font-medium text-[#277856]"><Link href="/products">Tiếp tục mua sắm</Link></Button></CardContent></Card>
    </div>}
  </main>;
}
