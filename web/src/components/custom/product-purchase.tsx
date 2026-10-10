"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { money } from '@/lib/format';
import type { CatalogProduct } from '@/services/types/response/catalog-res';
import { useCart } from './cart-provider';

export function ProductPurchase({ product }: { product: CatalogProduct }) {
  const router = useRouter();
  const { add, ready, branchId } = useCart();
  const [unitId, setUnitId] = useState(product.units.find(unit => unit.price !== null)?.id ?? product.units[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const unit = product.units.find(value => value.id === unitId);
  const available = product.availableBaseQuantity >= (unit?.conversionFactor ?? Infinity) * quantity;
  const canBuy = ready && !!branchId && !!unit && unit.price !== null && unit.price > 0 && available;

  return <div className="mt-7 border-t border-border pt-7">
    <p className="text-sm font-medium text-muted-foreground">Giá bán</p>
    <p className="mt-1 text-3xl font-bold text-primary">{unit?.price ? money(unit.price) : 'Liên hệ nhà thuốc'}</p>
    <p className="mt-2 text-xs text-muted-foreground">Đơn hàng được xác nhận trước khi giao. Giá có thể thay đổi khi cập nhật.</p>
    {product.units.length > 1 && <div className="mt-7"><Label htmlFor="product-unit" className="mb-2 block">Đơn vị bán</Label><Select value={unitId} onValueChange={setUnitId}><SelectTrigger id="product-unit" className="h-11 w-full rounded-xl bg-card"><SelectValue placeholder="Chọn đơn vị bán" /></SelectTrigger><SelectContent>{product.units.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>}
    <div className="mt-7 flex flex-wrap items-center gap-3"><ButtonGroup className="h-12 items-center rounded-xl border border-input bg-card p-1"><Button type="button" variant="ghost" size="icon-lg" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="size-10 text-primary" aria-label="Giảm số lượng"><Minus className="size-4" /></Button><ButtonGroupText aria-live="polite" className="h-full w-8 justify-center rounded-none border-0 bg-transparent px-0 text-sm font-semibold">{quantity}</ButtonGroupText><Button type="button" variant="ghost" size="icon-lg" onClick={() => setQuantity(Math.min(20, quantity + 1))} className="size-10 text-primary" aria-label="Tăng số lượng"><Plus className="size-4" /></Button></ButtonGroup><Button disabled={!canBuy} onClick={() => { if (unit) { add(product, unit, quantity); router.push('/cart'); } }} className="h-12 min-w-48 rounded-xl px-6 text-sm"><ShoppingBag className="size-4" /> Thêm vào giỏ hàng</Button></div>
    {!available && <Alert variant="destructive" className="mt-3"><AlertDescription>Số lượng đang chọn vượt quá tồn kho.</AlertDescription></Alert>}
    {!branchId && <Alert className="mt-3"><AlertDescription>Vui lòng chọn chi nhánh ở đầu trang để xem và mua hàng.</AlertDescription></Alert>}
  </div>;
}
