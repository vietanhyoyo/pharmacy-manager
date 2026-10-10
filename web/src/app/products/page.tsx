import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
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
    <Breadcrumb className="mb-8"><BreadcrumbList className="text-xs"><BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Trang chủ</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Sản phẩm</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
    <Card className="gap-0 rounded-2xl border-0 bg-muted/70 px-7 py-10 ring-0 md:px-12"><span className="text-xs font-bold uppercase tracking-[.2em] text-primary">Chăm sóc sức khỏe</span><h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Khám phá sản phẩm</h1><p className="mt-3 text-muted-foreground">Chọn sản phẩm phù hợp để chăm sóc bản thân và gia đình.</p></Card>
    <div className="mt-10 grid gap-8 lg:grid-cols-[230px_1fr]">
      <aside><h2 className="mb-5 text-lg font-semibold text-foreground">Danh mục</h2><div className="flex gap-2 overflow-x-auto pb-3 lg:flex-col lg:overflow-visible"><Button asChild variant={!category ? 'default' : 'outline'} className={`h-auto shrink-0 justify-start rounded-xl px-4 py-3 text-sm font-medium ${!category ? '' : 'border-transparent bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}><Link href="/products">Tất cả sản phẩm</Link></Button>{categories.map(item => <Button asChild key={item.id} variant={category === item.id ? 'default' : 'outline'} className={`h-auto shrink-0 justify-start rounded-xl px-4 py-3 text-sm font-medium ${category === item.id ? '' : 'border-transparent bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}><Link href={`/products?category=${item.id}`}>{item.name}</Link></Button>)}</div></aside>
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-muted-foreground">{result ? `${result.total} sản phẩm` : 'Danh mục sản phẩm'}</p><form action="/products" className="w-full sm:w-72"><InputGroup className="h-11 rounded-full bg-card"><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput name="search" defaultValue={search} placeholder="Tìm sản phẩm..." aria-label="Tìm sản phẩm" /></InputGroup>{category && <input type="hidden" name="category" value={category} />}</form></div>
        {unavailable ? <Alert className="bg-card p-10"><AlertDescription>Không tải được sản phẩm. Vui lòng thử lại sau.</AlertDescription></Alert> : result?.items.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{result.items.map(product => <ProductCard key={product.id} product={product} />)}</div> : <Empty className="rounded-2xl border border-dashed border-border bg-card"><EmptyHeader><EmptyTitle>Không tìm thấy sản phẩm</EmptyTitle><EmptyDescription>Thử từ khóa khác hoặc chọn một danh mục khác.</EmptyDescription></EmptyHeader></Empty>}
        {result && result.totalPages > 1 && <Pagination className="mt-10"><PaginationContent><PaginationItem>{page <= 1 ? <Button disabled variant="outline" size="default"><span className="hidden sm:block">Trước</span></Button> : <PaginationPrevious href={pageHref(page - 1)} text="Trước" />}</PaginationItem><PaginationItem><PaginationLink href={pageHref(page)} isActive size="icon">{page}</PaginationLink></PaginationItem><PaginationItem><span className="px-2 text-sm text-muted-foreground">/ {result.totalPages}</span></PaginationItem><PaginationItem>{page >= result.totalPages ? <Button disabled variant="outline" size="default"><span className="hidden sm:block">Sau</span></Button> : <PaginationNext href={pageHref(page + 1)} text="Sau" />}</PaginationItem></PaginationContent></Pagination>}
      </div>
    </div>
  </main>;
}
