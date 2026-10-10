import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/custom/product-card';
import { fetchCategories, fetchProducts } from '@/services/modules/catalog.service';
import type { CatalogCategory, CatalogPage } from '@/services/types/response/catalog-res';

export const metadata: Metadata = { title: 'Sản phẩm' };
export const dynamic = 'force-dynamic';

type Params = { search?: string; category?: string; page?: string };
export default async function ProductsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search.slice(0, 100) : '';
  const category = typeof params.category === 'string' && params.category !== 'all' ? params.category : '';
  const page = Math.max(1, Number(params.page) || 1);
  let categories: CatalogCategory[] = [];
  let result: CatalogPage | null = null;
  let unavailable = false;
  try { [categories, result] = await Promise.all([fetchCategories(), fetchProducts({ search, category, page })]); }
  catch { unavailable = true; }
  const pageHref = (nextPage: number) => `/products?${new URLSearchParams({ ...(search ? { search } : {}), ...(category ? { category } : {}), page: String(nextPage) })}`;

  return <main className="mx-auto min-h-[60vh] max-w-7xl px-5 py-10 lg:px-8">
    <div className="mb-8 flex items-center gap-2 text-xs font-medium text-[#7d9182]"><Link href="/" className="hover:text-[#1d7658]">Trang chủ</Link><ChevronRight className="size-3" /><span className="text-[#2c7051]">Sản phẩm</span></div>
    <Card className="gap-0 rounded-[2rem] border-0 bg-[#eaf3e9] px-7 py-10 ring-0 md:px-12"><span className="text-xs font-bold uppercase tracking-[.2em] text-[#3b9169]">Chăm sóc sức khỏe</span><h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#174b36]">Khám phá sản phẩm</h1><p className="mt-3 text-[#607a68]">Chọn sản phẩm phù hợp để chăm sóc bản thân và gia đình.</p></Card>
    <div className="mt-10 grid gap-8 lg:grid-cols-[230px_1fr]">
      <aside><h2 className="mb-5 text-lg font-semibold text-[#183f30]">Danh mục</h2><div className="flex gap-2 overflow-x-auto pb-3 lg:flex-col lg:overflow-visible"><Button asChild variant={!category ? 'default' : 'outline'} className={`h-auto shrink-0 justify-start rounded-xl px-4 py-3 text-sm font-medium ${!category ? 'bg-[#1d7658] text-white hover:bg-[#16583f]' : 'border-transparent bg-white text-[#56725e] hover:bg-[#edf5ed]'}`}><Link href="/products">Tất cả sản phẩm</Link></Button>{categories.map(item => <Button asChild key={item.id} variant={category === item.id ? 'default' : 'outline'} className={`h-auto shrink-0 justify-start rounded-xl px-4 py-3 text-sm font-medium ${category === item.id ? 'bg-[#1d7658] text-white hover:bg-[#16583f]' : 'border-transparent bg-white text-[#56725e] hover:bg-[#edf5ed]'}`}><Link href={`/products?category=${item.id}`}>{item.name}</Link></Button>)}</div></aside>
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-[#748777]">{result ? `${result.total} sản phẩm` : 'Danh mục sản phẩm'}</p><form action="/products" className="relative w-full sm:w-72"><Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#77907f]" /><Input name="search" defaultValue={search} placeholder="Tìm sản phẩm..." className="h-11 rounded-full border-[#dce8de] bg-white pl-11" aria-label="Tìm sản phẩm" />{category && <input type="hidden" name="category" value={category} />}</form></div>
        {unavailable ? <Alert className="border-[#e2eae2] bg-white p-10 text-[#657d6b]"><AlertDescription>Không tải được sản phẩm. Vui lòng thử lại sau.</AlertDescription></Alert> : result?.items.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{result.items.map(product => <ProductCard key={product.id} product={product} />)}</div> : <Card className="rounded-2xl border-[#e2eae2] bg-white p-10 py-10 text-[#657d6b]">Không tìm thấy sản phẩm phù hợp.</Card>}
        {result && result.totalPages > 1 && <div className="mt-10 flex items-center justify-center gap-3">{page <= 1 ? <Button disabled variant="outline" className="rounded-full border-[#dce8de] px-5">Trước</Button> : <Button asChild variant="outline" className="rounded-full border-[#dce8de] px-5"><Link href={pageHref(page - 1)}>Trước</Link></Button>}<span className="text-sm text-[#56725e]">{page} / {result.totalPages}</span>{page >= result.totalPages ? <Button disabled variant="outline" className="rounded-full border-[#dce8de] px-5">Sau</Button> : <Button asChild variant="outline" className="rounded-full border-[#dce8de] px-5"><Link href={pageHref(page + 1)}>Sau</Link></Button>}</div>}
      </div>
    </div>
  </main>;
}
