"use client";

import Link from 'next/link';
import { useState } from 'react';
import { HeartPulse, MapPin, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from './cart-provider';

export function SiteHeader() {
  const { items, ready, branches, branchId, selectBranch } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const count = ready ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  return <>
    <div className="bg-primary px-4 py-2 text-center text-xs font-medium tracking-wide text-primary-foreground">Chăm sóc sức khỏe mỗi ngày cùng Nhà thuốc An Tâm</div>
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-5 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3 text-foreground" aria-label="Nhà thuốc An Tâm - Trang chủ">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><HeartPulse className="size-6" strokeWidth={2.1} /></span>
          <span className="flex flex-col leading-tight"><strong className="text-xl tracking-tight">An Tâm</strong><small className="mt-0.5 text-[10px] font-bold uppercase tracking-[.24em] text-muted-foreground">Pharmacy</small></span>
        </Link>
        <nav className="ml-8 hidden items-center gap-8 text-sm font-semibold text-muted-foreground lg:flex" aria-label="Điều hướng chính">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <Link href="/products" className="hover:text-primary">Sản phẩm</Link>
          <Link href="/products?category=all" className="hover:text-primary">Danh mục</Link>
          <Link href="/order-status" className="hover:text-primary">Tra cứu đơn</Link>
        </nav>
        <form action="/products" className="ml-auto hidden max-w-sm flex-1 lg:block">
          <InputGroup className="h-11 rounded-full bg-card"><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput name="search" placeholder="Tìm thuốc, vitamin, sản phẩm..." aria-label="Tìm sản phẩm" className="text-sm" /></InputGroup>
        </form>
        <Button asChild variant="outline" size="icon-lg" className="relative ml-auto rounded-full text-primary lg:ml-0" aria-label={`Giỏ hàng, ${count} sản phẩm`}><Link href="/cart"><ShoppingBag className="size-5" />{count > 0 && <Badge className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full border-0 p-0 text-[10px]">{count}</Badge>}</Link></Button>
        <Button type="button" variant="ghost" size="icon-lg" className="text-primary lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}>{menuOpen ? <X /> : <Menu />}</Button>
      </div>
      <div className="border-t border-border/60 bg-muted/40 px-5 py-2"><div className="mx-auto flex max-w-7xl items-center gap-2 text-sm lg:px-3"><MapPin className="size-4 text-primary" /><span className="shrink-0 text-muted-foreground">Xem hàng tại</span><Select value={branchId || undefined} onValueChange={selectBranch}><SelectTrigger aria-label="Chọn chi nhánh mua hàng" className="h-9 max-w-64 border-0 bg-transparent font-semibold text-primary shadow-none"><SelectValue placeholder="Chọn chi nhánh" /></SelectTrigger><SelectContent position="popper" align="start">{branches.map(branch => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}</SelectContent></Select>{items.length > 0 && <span className="hidden text-xs text-muted-foreground sm:inline">Đổi chi nhánh sẽ xóa giỏ hàng hiện tại.</span>}</div></div>
      {menuOpen && <div className="border-t border-border bg-popover px-5 py-5 lg:hidden"><form action="/products" className="mb-5"><InputGroup className="rounded-full bg-card"><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput name="search" placeholder="Tìm sản phẩm" aria-label="Tìm sản phẩm" /></InputGroup></form><nav className="flex flex-col gap-4 text-sm font-semibold text-foreground"><Link onClick={() => setMenuOpen(false)} href="/">Trang chủ</Link><Link onClick={() => setMenuOpen(false)} href="/products">Sản phẩm</Link><Link onClick={() => setMenuOpen(false)} href="/order-status">Tra cứu đơn</Link><Link onClick={() => setMenuOpen(false)} href="/cart">Giỏ hàng</Link></nav></div>}
    </header>
  </>;
}
