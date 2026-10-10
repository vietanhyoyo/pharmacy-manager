import Link from 'next/link';
import { ArrowRight, HeartHandshake, Leaf, MessageCircleHeart, ShieldCheck, Truck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProductCard } from '@/components/custom/product-card';
import { fetchCategories, fetchProducts } from '@/services/modules/catalog.service';
import type { CatalogCategory, CatalogPage } from '@/services/types/response/catalog-res';

export const dynamic = 'force-dynamic';

const categoryIcons = ['✳', '✺', '✦', '✿', '◈', '✧'];

export default async function Home() {
  let categories: CatalogCategory[] = [];
  let products: CatalogPage | null = null;
  let unavailable = false;
  try { [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]); }
  catch { unavailable = true; }

  return <main>
    <section className="relative overflow-hidden bg-[#eaf3e9]">
      <div className="absolute -right-20 -top-32 size-[550px] rounded-full border-[90px] border-white/20" />
      <div className="absolute -bottom-56 right-1/4 size-[500px] rounded-full bg-[#dcebdd]/60 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24 lg:px-8">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c7dfcd] bg-white/65 px-4 py-2 text-xs font-semibold uppercase tracking-[.15em] text-[#247051]"><Leaf className="size-4" /> Sức khỏe là điều quý giá</span>
          <h1 className="mt-7 text-5xl font-semibold leading-[1.12] tracking-[-.045em] text-[#153e30] sm:text-6xl lg:text-[4.7rem]">Chăm sóc bạn,<br /><em className="font-serif font-normal text-[#3b8e68]">trọn vẹn mỗi ngày.</em></h1>
          <p className="mt-7 max-w-lg text-[17px] leading-8 text-[#587364]">Tìm sản phẩm chăm sóc sức khỏe phù hợp cho gia đình. Mua sắm thuận tiện, được nhà thuốc xác nhận trước khi giao.</p>
          <div className="mt-9 flex flex-wrap items-center gap-4"><Button asChild size="lg" className="h-12 rounded-full bg-[#1d7658] px-6 text-sm font-semibold text-white shadow-lg shadow-[#1d7658]/15 hover:bg-[#16583f]"><Link href="/products">Khám phá sản phẩm <ArrowRight className="size-4" /></Link></Button><span className="text-sm font-medium text-[#547565]">An tâm từ lựa chọn đầu tiên</span></div>
          <div className="mt-12 flex items-center gap-8 border-t border-[#cbded0] pt-6 text-sm text-[#557263]"><span className="flex items-center gap-2"><ShieldCheck className="size-5 text-[#328665]" /> Chọn lọc cẩn thận</span><span className="flex items-center gap-2"><HeartHandshake className="size-5 text-[#328665]" /> Tận tâm hỗ trợ</span></div>
        </div>
        <div className="relative mx-auto flex aspect-[1.1] w-full max-w-[530px] items-center justify-center">
          <div className="absolute inset-[9%] rounded-full bg-[#cfe5d2]" />
          <div className="absolute inset-[17%] rounded-full border-2 border-white/60" />
          <div className="absolute left-[13%] top-[20%] flex size-20 items-center justify-center rounded-[1.6rem] bg-white shadow-[0_18px_38px_rgba(49,105,74,.13)] sm:size-24"><span className="text-4xl">✳</span></div>
          <div className="absolute right-[6%] top-[17%] flex size-24 rotate-12 items-center justify-center rounded-[2rem] bg-[#f9e8d4] shadow-[0_18px_38px_rgba(49,105,74,.11)]"><Leaf className="size-11 text-[#b88758]" /></div>
          <div className="relative flex h-[60%] w-[50%] -rotate-6 flex-col items-center justify-center rounded-[2.6rem] border-[9px] border-white bg-[#fdfcf8] shadow-[0_30px_70px_rgba(40,91,63,.18)]"><span className="flex size-20 items-center justify-center rounded-3xl bg-[#e4f2e7] text-5xl text-[#438c65]">✚</span><span className="mt-8 text-xs font-bold uppercase tracking-[.3em] text-[#5f9b73]">An Tâm</span><strong className="mt-2 text-3xl text-[#1d5d42]">Wellness</strong><span className="mt-4 h-1 w-20 rounded-full bg-[#d9e7dd]" /><span className="mt-3 h-1 w-14 rounded-full bg-[#e8efe8]" /></div>
          <div className="absolute bottom-[11%] right-[1%] rounded-2xl bg-white px-5 py-4 shadow-[0_15px_35px_rgba(49,105,74,.12)]"><span className="text-sm font-bold text-[#245d44]">Tận tâm từng đơn hàng</span><p className="mt-1 text-xs text-[#789584]">Nhà thuốc xác nhận trước khi giao</p></div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-[.2em] text-[#3b9169]">Danh mục sản phẩm</span><h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#183f30] sm:text-4xl">Chọn điều cơ thể cần</h2></div><Link href="/products" className="flex items-center gap-2 text-sm font-semibold text-[#267a58] hover:underline">Xem tất cả <ArrowRight className="size-4" /></Link></div>
      {unavailable ? <Alert className="rounded-3xl border-[#e4eae5] bg-white p-8"><AlertDescription className="text-[#667e6e]">Chưa kết nối được danh mục sản phẩm. Vui lòng tải lại trang sau ít phút.</AlertDescription></Alert> : categories.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">{categories.slice(0, 6).map((category, index) => <Link href={`/products?category=${category.id}`} key={category.id} className="group"><Card className="min-h-40 justify-between rounded-[1.5rem] border border-[#e2ebe3] bg-white p-5 transition hover:border-[#b8d9c5] hover:bg-[#f1f8f1]"><span className="flex size-11 items-center justify-center rounded-2xl bg-[#eaf4eb] text-2xl text-[#328365]">{categoryIcons[index]}</span><span className="flex items-end justify-between gap-2 font-semibold text-[#244b37]">{category.name}<ArrowRight className="size-4 shrink-0 opacity-50 transition group-hover:translate-x-1" /></span></Card></Link>)}</div> : <Card className="rounded-3xl border-[#e4eae5] bg-white p-8 text-[#667e6e]">Chưa có danh mục đang bán.</Card>}
    </section>

    <section className="bg-white/75 py-16"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-[.2em] text-[#3b9169]">Gợi ý cho bạn</span><h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#183f30] sm:text-4xl">Sản phẩm được quan tâm</h2></div><Link href="/products" className="flex items-center gap-2 text-sm font-semibold text-[#267a58] hover:underline">Khám phá thêm <ArrowRight className="size-4" /></Link></div>{products?.items.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.items.slice(0, 8).map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="rounded-3xl border border-[#e4eae5] bg-white p-8 text-[#667e6e]">Hiện chưa có sản phẩm đang bán.</div>}</div></section>

    <section className="mx-auto grid max-w-7xl gap-5 px-5 py-16 md:grid-cols-3 lg:px-8">{[{ icon: ShieldCheck, title: 'Nguồn hàng rõ ràng', body: 'Thông tin sản phẩm và đơn vị bán được thể hiện minh bạch.' }, { icon: Truck, title: 'Mua sắm thuận tiện', body: 'Chọn sản phẩm và gửi yêu cầu đặt hàng chỉ trong vài bước.' }, { icon: MessageCircleHeart, title: 'Nhà thuốc đồng hành', body: 'Mỗi đơn hàng được kiểm tra trước khi xác nhận giao.' }].map(({ icon: Icon, title, body }) => <Card key={title} className="rounded-[1.75rem] border-[#e1eae2] bg-[#f0f6ef] p-7"><span className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#31815f]"><Icon className="size-6" /></span><h3 className="mt-5 text-lg font-semibold text-[#204b36]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#6e8172]">{body}</p></Card>)}</section>
  </main>;
}
