import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { ProductArt } from '@/components/custom/product-art';
import { ProductPurchase } from '@/components/custom/product-purchase';
import { fetchProduct } from '@/services/modules/catalog.service';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Chi tiết sản phẩm' };

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProduct(slug).catch(() => null);
  if (!product) notFound();
  return <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
    <Breadcrumb className="mb-8"><BreadcrumbList className="text-xs"><BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Trang chủ</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink asChild><Link href="/products">Sản phẩm</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16"><ProductArt sku={product.sku} imageUrl={product.imageUrl} large /><div className="py-2"><Badge variant="secondary" className="h-auto rounded-full px-4 py-2 text-xs font-semibold">{product.category?.name ?? 'Chăm sóc sức khỏe'}</Badge><h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-foreground">{product.name}</h1><p className="mt-3 text-sm text-muted-foreground">Mã sản phẩm: {product.sku}</p><p className="mt-6 text-base leading-8 text-muted-foreground">{product.description || 'Sản phẩm chăm sóc sức khỏe tại Nhà thuốc An Tâm.'}</p><ProductPurchase product={product} /><div className="mt-8 grid gap-4 sm:grid-cols-2"><Card className="flex-row items-start gap-3 rounded-2xl border-0 bg-muted p-4 text-sm text-muted-foreground ring-0"><ShieldCheck className="size-5 shrink-0 text-primary" /><span>Sản phẩm được nhà thuốc kiểm tra thông tin trước khi bán.</span></Card><Card className="flex-row items-start gap-3 rounded-2xl border-0 bg-muted p-4 text-sm text-muted-foreground ring-0"><Truck className="size-5 shrink-0 text-primary" /><span>Nhà thuốc liên hệ xác nhận trước khi giao.</span></Card></div></div></div>
    <Card className="mt-16 gap-0 rounded-2xl border-border bg-card p-8 py-8"><h2 className="text-2xl font-semibold text-card-foreground">Thông tin sản phẩm</h2><dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2"><div className="border-b border-border pb-3"><dt className="text-muted-foreground">Hoạt chất</dt><dd className="mt-1 font-medium">{product.activeIngredient || 'Đang cập nhật'}</dd></div><div className="border-b border-border pb-3"><dt className="text-muted-foreground">Hàm lượng</dt><dd className="mt-1 font-medium">{product.strength || 'Đang cập nhật'}</dd></div><div className="border-b border-border pb-3"><dt className="text-muted-foreground">Dạng bào chế</dt><dd className="mt-1 font-medium">{product.dosageForm || 'Đang cập nhật'}</dd></div><div className="border-b border-border pb-3"><dt className="text-muted-foreground">Loại</dt><dd className="mt-1 font-medium">Không kê đơn</dd></div></dl><p className="mt-6 text-xs leading-6 text-muted-foreground">Thông tin chỉ để tham khảo. Đọc kỹ hướng dẫn sử dụng và hỏi dược sĩ nếu cần.</p></Card>
  </main>;
}
