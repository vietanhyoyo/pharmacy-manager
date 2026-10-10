import Link from 'next/link';
import { ArrowRight, HeartHandshake, Leaf, MessageCircleHeart, ShieldCheck, Truck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
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
    <section className="relative overflow-hidden bg-muted/60">
      <div className="absolute -right-20 -top-32 size-[550px] rounded-full border-[90px] border-primary/10" />
      <div className="absolute -bottom-56 right-1/4 size-[500px] rounded-full bg-accent/70 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24 lg:px-8">
        <div className="max-w-xl">
          <Badge variant="outline" className="h-auto gap-2 rounded-full border-primary/20 bg-card/70 px-4 py-2 text-xs font-semibold uppercase tracking-[.15em] text-primary"><Leaf className="size-4" /> Sức khỏe là điều quý giá</Badge>
          <h1 className="mt-7 text-5xl font-semibold leading-[1.12] tracking-[-.045em] text-foreground sm:text-6xl lg:text-[4.7rem]">Chăm sóc bạn,<br /><em className="font-normal text-primary">trọn vẹn mỗi ngày.</em></h1>
          <p className="mt-7 max-w-lg text-[17px] leading-8 text-muted-foreground">Tìm sản phẩm chăm sóc sức khỏe phù hợp cho gia đình. Mua sắm thuận tiện, được nhà thuốc xác nhận trước khi giao.</p>
          <div className="mt-9 flex flex-wrap items-center gap-4"><Button asChild size="lg" className="h-12 rounded-full px-6 text-sm font-semibold shadow-lg shadow-primary/15"><Link href="/products">Khám phá sản phẩm <ArrowRight className="size-4" /></Link></Button><span className="text-sm font-medium text-muted-foreground">An tâm từ lựa chọn đầu tiên</span></div>
          <div className="mt-12 flex items-center gap-8 border-t border-border pt-6 text-sm text-muted-foreground"><span className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary" /> Chọn lọc cẩn thận</span><span className="flex items-center gap-2"><HeartHandshake className="size-5 text-primary" /> Tận tâm hỗ trợ</span></div>
        </div>
        <div className="relative mx-auto flex aspect-[1.1] w-full max-w-[530px] items-center justify-center">
          <div className="absolute inset-[9%] rounded-full bg-secondary" />
          <div className="absolute inset-[17%] rounded-full border-2 border-card/70" />
          <Card className="absolute left-[13%] top-[20%] flex size-20 items-center justify-center gap-0 rounded-[1.6rem] border-0 bg-card p-0 text-4xl shadow-lg ring-0 sm:size-24">✳</Card>
          <Card className="absolute right-[6%] top-[17%] flex size-24 rotate-12 items-center justify-center gap-0 rounded-[2rem] border-0 bg-accent p-0 shadow-lg ring-0"><Leaf className="size-11 text-primary" /></Card>
          <Card className="relative flex h-[60%] w-[50%] -rotate-6 flex-col items-center justify-center gap-0 rounded-[2.6rem] border-[9px] border-background bg-card shadow-xl"><span className="flex size-20 items-center justify-center rounded-3xl bg-accent text-5xl text-primary">✚</span><span className="mt-8 text-xs font-bold uppercase tracking-[.3em] text-primary">An Tâm</span><strong className="mt-2 text-3xl text-foreground">Wellness</strong><span className="mt-4 h-1 w-20 rounded-full bg-border" /><span className="mt-3 h-1 w-14 rounded-full bg-muted" /></Card>
          <Card className="absolute bottom-[11%] right-[1%] gap-1 rounded-2xl border-0 bg-card px-5 py-4 shadow-lg"><span className="text-sm font-bold text-card-foreground">Tận tâm từng đơn hàng</span><p className="text-xs text-muted-foreground">Nhà thuốc xác nhận trước khi giao</p></Card>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-[.2em] text-primary">Danh mục sản phẩm</span><h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Chọn điều cơ thể cần</h2></div><Button asChild variant="link" className="gap-2 text-primary"><Link href="/products">Xem tất cả <ArrowRight className="size-4" /></Link></Button></div>
      {unavailable ? <Alert className="rounded-2xl bg-card p-8"><AlertDescription>Chưa kết nối được danh mục sản phẩm. Vui lòng tải lại trang sau ít phút.</AlertDescription></Alert> : categories.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">{categories.slice(0, 6).map((category, index) => <Link href={`/products?category=${category.id}`} key={category.id} className="group"><Card className="min-h-40 justify-between rounded-2xl border-border bg-card p-5 transition hover:border-primary/40 hover:bg-accent/50"><span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-2xl text-primary">{categoryIcons[index]}</span><span className="flex items-end justify-between gap-2 font-semibold text-card-foreground">{category.name}<ArrowRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" /></span></Card></Link>)}</div> : <Empty className="rounded-2xl border border-dashed border-border"><EmptyHeader><EmptyTitle>Chưa có danh mục</EmptyTitle><EmptyDescription>Danh mục sản phẩm sẽ xuất hiện tại đây.</EmptyDescription></EmptyHeader></Empty>}
    </section>

    <section className="bg-card/70 py-16"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-[.2em] text-primary">Gợi ý cho bạn</span><h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Sản phẩm được quan tâm</h2></div><Button asChild variant="link" className="gap-2 text-primary"><Link href="/products">Khám phá thêm <ArrowRight className="size-4" /></Link></Button></div>{products?.items.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.items.slice(0, 8).map(product => <ProductCard key={product.id} product={product} />)}</div> : <Empty className="rounded-2xl border border-dashed border-border"><EmptyHeader><EmptyTitle>Chưa có sản phẩm</EmptyTitle><EmptyDescription>Sản phẩm đang bán sẽ xuất hiện tại đây.</EmptyDescription></EmptyHeader></Empty>}</div></section>

    <section className="mx-auto grid max-w-7xl gap-5 px-5 py-16 md:grid-cols-3 lg:px-8">{[{ icon: ShieldCheck, title: 'Nguồn hàng rõ ràng', body: 'Thông tin sản phẩm và đơn vị bán được thể hiện minh bạch.' }, { icon: Truck, title: 'Mua sắm thuận tiện', body: 'Chọn sản phẩm và gửi yêu cầu đặt hàng chỉ trong vài bước.' }, { icon: MessageCircleHeart, title: 'Nhà thuốc đồng hành', body: 'Mỗi đơn hàng được kiểm tra trước khi xác nhận giao.' }].map(({ icon: Icon, title, body }) => <Card key={title} className="rounded-2xl border-border bg-muted/60 p-7"><span className="flex size-12 items-center justify-center rounded-xl bg-card text-primary"><Icon className="size-6" /></span><h3 className="mt-5 text-lg font-semibold text-card-foreground">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p></Card>)}</section>
  </main>;
}
