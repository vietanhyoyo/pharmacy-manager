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
    <Card className="gap-0 rounded-[1.65rem] border border-[#e4eae5] bg-white p-3 py-3 transition hover:-translate-y-1 hover:border-[#bdcec5] hover:shadow-[0_22px_50px_rgba(36,72,58,.1)]">
      <div className="relative">
        <ProductArt sku={product.sku} imageUrl={product.imageUrl} />
        <Badge className="absolute left-3 top-3 border-0 bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#427c68] shadow-sm">Không kê đơn</Badge>
      </div>
      <div className="px-2 pb-2 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[.12em] text-[#789083]">{product.category?.name ?? 'Chăm sóc sức khỏe'}</p>
        <h3 className="line-clamp-2 min-h-12 text-[17px] font-semibold leading-6 text-[#18382d] group-hover:text-[#278567]">{product.name}</h3>
        <p className="mt-2 line-clamp-1 text-sm text-[#718078]">{product.strength || product.dosageForm || 'Sản phẩm chăm sóc sức khỏe'}</p>
        <div className="mt-5 flex items-end justify-between border-t border-[#edf0ed] pt-4">
          <div><p className="text-[11px] text-[#829188]">Giá tham khảo</p><p className="text-lg font-bold text-[#1d684f]">{unit?.price ? money(unit.price) : 'Liên hệ'}</p></div>
          <span className="flex size-9 items-center justify-center rounded-full bg-[#edf6ef] text-[#278567] transition group-hover:bg-[#1f7b5d] group-hover:text-white"><ArrowUpRight className="size-4" /></span>
        </div>
      </div>
    </Card>
  </Link>;
}
