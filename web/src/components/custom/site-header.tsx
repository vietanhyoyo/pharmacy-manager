"use client";

import Link from 'next/link';
import { useState } from 'react';
import { HeartPulse, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { useCart } from './cart-provider';

export function SiteHeader() {
  const { items, ready } = useCart();
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
        </nav>
        <form action="/products" className="ml-auto hidden max-w-sm flex-1 lg:block">
          <InputGroup className="h-11 rounded-full bg-card"><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput name="search" placeholder="Tìm thuốc, vitamin, sản phẩm..." aria-label="Tìm sản phẩm" className="text-sm" /></InputGroup>
        </form>
        <Button asChild variant="outline" size="icon-lg" className="relative ml-auto rounded-full text-primary lg:ml-0" aria-label={`Giỏ hàng, ${count} sản phẩm`}><Link href="/cart"><ShoppingBag className="size-5" />{count > 0 && <Badge className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full border-0 p-0 text-[10px]">{count}</Badge>}</Link></Button>
        <Button type="button" variant="ghost" size="icon-lg" className="text-primary lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}>{menuOpen ? <X /> : <Menu />}</Button>
      </div>
      {menuOpen && <div className="border-t border-border bg-popover px-5 py-5 lg:hidden"><form action="/products" className="mb-5"><InputGroup className="rounded-full bg-card"><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput name="search" placeholder="Tìm sản phẩm" aria-label="Tìm sản phẩm" /></InputGroup></form><nav className="flex flex-col gap-4 text-sm font-semibold text-foreground"><Link onClick={() => setMenuOpen(false)} href="/">Trang chủ</Link><Link onClick={() => setMenuOpen(false)} href="/products">Sản phẩm</Link><Link onClick={() => setMenuOpen(false)} href="/cart">Giỏ hàng</Link></nav></div>}
    </header>
  </>;
}
