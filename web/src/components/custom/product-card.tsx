import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ProductArt } from './product-art';
import { money } from '@/lib/format';
import type { CatalogProduct } from '@/services/types/response/catalog-res';

export function ProductCard({ product }: { product: CatalogProduct }) {
  const unit = product.units.find(value => value.price !== null);
  return <Link href={`/products/${product.slug}`} className="group block min-w-0">
    <Card className="gap-0 rounded-2xl border-border bg-card p-3 py-3 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
      <div className="relative">
        <ProductArt sku={product.sku} imageUrl={product.imageUrl} />
        <Badge variant="secondary" className="absolute left-3 top-3 px-3 text-[11px] font-semibold shadow-sm">Không kê đơn</Badge>
      </div>
      <div className="px-2 pb-2 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">{product.category?.name ?? 'Chăm sóc sức khỏe'}</p>
        <h3 className="line-clamp-2 min-h-12 text-base font-semibold leading-6 text-card-foreground group-hover:text-primary">{product.name}</h3>
        <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{product.strength || product.dosageForm || 'Sản phẩm chăm sóc sức khỏe'}</p>
        <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
          <div><p className="text-[11px] text-muted-foreground">Giá tham khảo</p><p className="text-lg font-bold text-primary">{unit?.price ? money(unit.price) : 'Liên hệ'}</p></div>
          <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition group-hover:bg-primary group-hover:text-primary-foreground"><ArrowUpRight className="size-4" /></span>
        </div>
      </div>
    </Card>
  </Link>;
}
