"use client";

import Link from 'next/link';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/components/custom/cart-provider';
import { money } from '@/lib/format';

export default function CartPage() {
  const { items, ready, update, remove } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return <main className="mx-auto min-h-[60vh] max-w-7xl px-5 py-12 lg:px-8">
    <div className="mb-10"><span className="text-xs font-bold uppercase tracking-[.2em] text-primary">Giỏ hàng của bạn</span><h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Sản phẩm đã chọn</h1></div>
    {!ready ? <Card className="rounded-2xl border-border bg-card p-10 py-10 text-muted-foreground">Đang tải giỏ hàng...</Card> : !items.length ? <Empty className="min-h-[360px] rounded-2xl border border-dashed border-border bg-card px-5 py-16"><EmptyMedia variant="icon" className="size-16 rounded-2xl"><ShoppingBag className="size-8" /></EmptyMedia><EmptyHeader><EmptyTitle className="text-2xl">Giỏ hàng đang trống</EmptyTitle><EmptyDescription>Cùng tìm sản phẩm phù hợp cho bạn nhé.</EmptyDescription></EmptyHeader><EmptyContent><Button asChild className="rounded-full"><Link href="/products">Khám phá sản phẩm <ArrowRight className="size-4" /></Link></Button></EmptyContent></Empty> : <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">{items.map(item => <Card key={item.productUnitId} className="rounded-2xl border-border bg-card py-0"><CardContent className="flex flex-wrap items-center gap-5 p-5 sm:flex-nowrap"><div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-secondary text-3xl text-primary">✚</div><div className="min-w-0 flex-1"><Link href={`/products/${item.slug}`} className="line-clamp-2 font-semibold text-card-foreground hover:text-primary hover:underline">{item.name}</Link><p className="mt-1 text-xs text-muted-foreground">Đơn vị: {item.unitName}</p><p className="mt-2 text-sm font-semibold text-primary">{money(item.price)}</p></div><div className="flex items-center gap-3"><ButtonGroup className="h-10 items-center rounded-xl border border-input bg-card p-0.5"><Button type="button" variant="ghost" size="icon-lg" onClick={() => update(item.productUnitId, item.quantity - 1)} className="size-9 text-primary" aria-label="Giảm số lượng"><Minus className="size-4" /></Button><ButtonGroupText aria-live="polite" className="h-full w-7 justify-center rounded-none border-0 bg-transparent px-0 text-sm font-semibold">{item.quantity}</ButtonGroupText><Button type="button" variant="ghost" size="icon-lg" onClick={() => update(item.productUnitId, item.quantity + 1)} className="size-9 text-primary" aria-label="Tăng số lượng"><Plus className="size-4" /></Button></ButtonGroup><Button type="button" variant="ghost" size="icon-lg" onClick={() => remove(item.productUnitId)} className="rounded-full text-destructive" aria-label={`Xóa ${item.name}`}><Trash2 className="size-4" /></Button></div></CardContent></Card>)}</div>
      <Card className="h-fit rounded-2xl border-border bg-muted/70 py-0"><CardHeader className="p-7 pb-0"><CardTitle className="text-xl font-semibold text-card-foreground">Tóm tắt đơn hàng</CardTitle></CardHeader><CardContent className="p-7 pt-6"><div className="flex justify-between text-sm text-muted-foreground"><span>Tạm tính</span><span>{money(subtotal)}</span></div><div className="mt-3 flex justify-between text-sm text-muted-foreground"><span>Phí giao hàng</span><span>Miễn phí</span></div><Separator className="my-6" /><div className="flex justify-between text-lg font-bold text-foreground"><span>Tổng cộng</span><span>{money(subtotal)}</span></div><p className="mt-4 text-xs leading-5 text-muted-foreground">Giá và tồn kho sẽ được kiểm tra lại khi gửi yêu cầu đặt hàng.</p><Button asChild className="mt-6 h-12 w-full rounded-xl"><Link href="/checkout">Tiếp tục đặt hàng <ArrowRight className="size-4" /></Link></Button><Button asChild variant="link" className="mt-4 h-auto w-full text-sm font-medium"><Link href="/products">Tiếp tục mua sắm</Link></Button></CardContent></Card>
    </div>}
  </main>;
}
