"use client";

import Link from 'next/link';
import { useState } from 'react';
import { HeartPulse, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from './cart-provider';

export function SiteHeader() {
  const { items, ready } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const count = ready ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  return <>
    <div className="bg-[#164f3d] px-4 py-2 text-center text-xs font-medium tracking-wide text-white">Chăm sóc sức khỏe mỗi ngày cùng Nhà thuốc An Tâm</div>
    <header className="sticky top-0 z-40 border-b border-[#e5ece7] bg-[#fcfdfb]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-5 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3 text-[#174b3a]" aria-label="Nhà thuốc An Tâm - Trang chủ">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#1d7658] text-white"><HeartPulse className="size-6" strokeWidth={2.1} /></span>
          <span className="flex flex-col leading-tight"><strong className="text-xl tracking-tight">An Tâm</strong><small className="mt-0.5 text-[10px] font-bold uppercase tracking-[.24em] text-[#6b897b]">Pharmacy</small></span>
        </Link>
        <nav className="ml-8 hidden items-center gap-8 text-sm font-semibold text-[#52675a] lg:flex" aria-label="Điều hướng chính">
          <Link href="/" className="hover:text-[#1d7658]">Trang chủ</Link>
          <Link href="/products" className="hover:text-[#1d7658]">Sản phẩm</Link>
          <Link href="/products?category=all" className="hover:text-[#1d7658]">Danh mục</Link>
        </nav>
        <form action="/products" className="relative ml-auto hidden max-w-sm flex-1 lg:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#759081]" /><Input name="search" placeholder="Tìm thuốc, vitamin, sản phẩm..." className="h-11 rounded-full border-[#e2eae4] bg-white pl-11 text-sm text-[#1e3d30] placeholder:text-[#a0aaa2]" aria-label="Tìm sản phẩm" />
        </form>
        <Button asChild variant="outline" size="icon-lg" className="relative ml-auto rounded-full border-[#dfe9e1] text-[#215b45] hover:bg-[#eaf5ee] lg:ml-0" aria-label={`Giỏ hàng, ${count} sản phẩm`}><Link href="/cart"><ShoppingBag className="size-5" />{count > 0 && <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#e78c69] text-[10px] font-bold text-white">{count}</span>}</Link></Button>
        <Button type="button" variant="ghost" size="icon-lg" className="text-[#215b45] lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}>{menuOpen ? <X /> : <Menu />}</Button>
      </div>
      {menuOpen && <div className="border-t border-[#e5ece7] bg-white px-5 py-5 lg:hidden"><form action="/products" className="relative mb-5"><Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#759081]" /><Input name="search" placeholder="Tìm sản phẩm" aria-label="Tìm sản phẩm" className="rounded-full pl-11" /></form><nav className="flex flex-col gap-4 text-sm font-semibold text-[#2e5943]"><Link onClick={() => setMenuOpen(false)} href="/">Trang chủ</Link><Link onClick={() => setMenuOpen(false)} href="/products">Sản phẩm</Link><Link onClick={() => setMenuOpen(false)} href="/cart">Giỏ hàng</Link></nav></div>}
    </header>
  </>;
}
