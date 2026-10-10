import { ArrowDownLeft, ArrowUpRight, Boxes, Pencil, Pill, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemHeader, ItemTitle } from '@/components/ui/item';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatDate, money, number } from '@/components/customs/tables/app-table';
import { StatusBadge } from '@/components/ui/status-badge';
import type { Issue } from '@/lib/api/res/issues.res';
import type { Lot } from '@/lib/api/res/lots.res';
import type { Movement } from '@/lib/api/res/movements.res';
import type { Product } from '@/lib/api/res/products.res';
import type { Receipt } from '@/lib/api/res/receipts.res';
import type { Stock } from '@/lib/api/res/stock.res';
import type { Supplier } from '@/lib/api/res/suppliers.res';
import type { Section } from '@/lib/types';

const isExpiring = (value?: string | null) => !!value && new Date(value).getTime() < Date.now() + 90 * 86400000;
const reasons: Record<string, string> = { INTERNAL_USE: 'Sử dụng nội bộ', DAMAGED: 'Hư hỏng', EXPIRED: 'Hết hạn', SAMPLE: 'Hàng mẫu', OTHER: 'Khác' };
const movementLabels: Record<string, string> = { PURCHASE_RECEIPT: 'Nhập kho', INTERNAL_USE: 'Xuất kho', DAMAGE: 'Hư hỏng', EXPIRY: 'Hết hạn' };

function Identity({ icon: Icon, title, detail }: { icon: typeof Pill; title: string; detail: string }) {
  return <div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground"><Icon className="size-4" /></span><div className="min-w-0 flex-1"><div className="truncate font-medium text-foreground" title={title}>{title}</div><div className="mt-0.5 truncate text-xs text-muted-foreground" title={detail}>{detail}</div></div></div>;
}

function EditAction({ label, onClick }: { label: string; onClick: () => void }) {
  return <Button variant="ghost" size="icon-sm" aria-label={`Chỉnh sửa ${label}`} title={`Chỉnh sửa ${label}`} onClick={onClick}><Pencil className="size-3.5" /></Button>;
}

function Status({ value }: { value: string }) {
  return <StatusBadge value={value} />;
}

export function InventoryDataRow({ section, item, onEdit }: { section: Section; item: unknown; onEdit: (row: Product | Lot | Supplier) => void }) {
  if (section === 'products') {
    const row = item as Product;
    return <TableRow><TableCell><Identity icon={Pill} title={row.name} detail={`${row.sku} · ${row.activeIngredient || 'Chưa có hoạt chất'}`} /></TableCell><TableCell><div className="truncate font-medium" title={row.categoryName || 'Chưa phân nhóm'}>{row.categoryName || 'Chưa phân nhóm'}</div><div className="mt-0.5 truncate text-xs text-muted-foreground">{row.dosageForm || '—'}</div></TableCell><TableCell>{row.unitName}</TableCell><TableCell className="text-right font-semibold tabular-nums">{number(row.quantity)}</TableCell><TableCell><Status value={row.status} /></TableCell><TableCell className="text-right"><EditAction label={row.name} onClick={() => onEdit(row)} /></TableCell></TableRow>;
  }
  if (section === 'lots') {
    const row = item as Lot;
    return <TableRow><TableCell><Identity icon={Boxes} title={row.productName} detail={row.sku} /></TableCell><TableCell><Badge variant="outline" className="rounded-md font-mono">{row.batchNumber}</Badge></TableCell><TableCell><div className={isExpiring(row.expiryDate) ? 'font-medium' : ''}>{formatDate(row.expiryDate)}</div>{isExpiring(row.expiryDate) && <div className="mt-0.5 text-xs text-muted-foreground">Sắp hết hạn</div>}</TableCell><TableCell className="text-right font-semibold tabular-nums">{number(row.quantity)}</TableCell><TableCell><Status value={row.status} /></TableCell><TableCell className="text-right"><EditAction label={row.batchNumber} onClick={() => onEdit(row)} /></TableCell></TableRow>;
  }
  if (section === 'stock') {
    const row = item as Stock;
    return <TableRow><TableCell><Identity icon={Pill} title={row.productName} detail={row.sku} /></TableCell><TableCell><div className="font-mono text-xs font-medium">{row.batchNumber}</div><div className="mt-0.5 text-xs text-muted-foreground">HSD {formatDate(row.expiryDate)}</div></TableCell><TableCell>{row.warehouseName}</TableCell><TableCell className="text-right tabular-nums">{number(row.onHandQty)}</TableCell><TableCell className="text-right font-semibold tabular-nums">{number(row.availableQty)}</TableCell></TableRow>;
  }
  if (section === 'receipts') {
    const row = item as Receipt;
    return <TableRow><TableCell><Identity icon={ArrowDownLeft} title={row.receiptNumber} detail="Phiếu nhập kho" /></TableCell><TableCell className="font-medium">{row.supplierName}</TableCell><TableCell>{formatDate(row.receivedAt)}</TableCell><TableCell className="text-right tabular-nums">{number(row.lineCount)}</TableCell><TableCell className="text-right font-semibold tabular-nums">{number(row.totalQuantity)}</TableCell><TableCell className="text-right tabular-nums">{money(row.totalAmount)}</TableCell><TableCell><Status value={row.status} /></TableCell></TableRow>;
  }
  if (section === 'issues') {
    const row = item as Issue;
    return <TableRow><TableCell><Identity icon={ArrowUpRight} title={row.issueNumber} detail="Phiếu xuất kho" /></TableCell><TableCell>{reasons[row.reasonCode] || row.reasonCode}</TableCell><TableCell>{formatDate(row.issuedAt)}</TableCell><TableCell className="text-right tabular-nums">{number(row.lineCount)}</TableCell><TableCell className="text-right font-semibold tabular-nums">{number(row.totalQuantity)}</TableCell><TableCell><Status value={row.status} /></TableCell></TableRow>;
  }
  if (section === 'suppliers') {
    const row = item as Supplier;
    return <TableRow><TableCell><Identity icon={Truck} title={row.name} detail={row.code} /></TableCell><TableCell>{row.phone || '—'}</TableCell><TableCell><Status value={row.status} /></TableCell><TableCell className="text-right"><EditAction label={row.name} onClick={() => onEdit(row)} /></TableCell></TableRow>;
  }
  const row = item as Movement;
  const positive = Number(row.quantityDelta) > 0;
  return <TableRow><TableCell>{formatDate(row.postedAt)}</TableCell><TableCell><Identity icon={positive ? ArrowDownLeft : ArrowUpRight} title={row.productName} detail={row.batchNumber} /></TableCell><TableCell><Badge variant="secondary">{movementLabels[row.movementType] || row.movementType}</Badge></TableCell><TableCell className="text-right font-semibold tabular-nums">{positive ? '+' : ''}{number(row.quantityDelta)}</TableCell><TableCell className="font-mono text-xs">{row.referenceNo || '—'}</TableCell></TableRow>;
}

export function InventoryMobileRow({ section, item, onEdit }: { section: Section; item: unknown; onEdit: (row: Product | Lot | Supplier) => void }) {
  let title = '';
  let detail = '';
  let note = '';
  let amount = '';
  let status: string | undefined;
  let editable: Product | Lot | Supplier | undefined;
  if (section === 'products') { const row = item as Product; title = row.name; detail = `${row.sku} · ${row.categoryName || 'Chưa phân nhóm'}`; note = row.dosageForm || ''; amount = `${number(row.quantity)} ${row.unitName}`; status = row.status; editable = row; }
  else if (section === 'lots') { const row = item as Lot; title = row.productName; detail = `Lô ${row.batchNumber}`; note = `Hạn dùng ${formatDate(row.expiryDate)}`; amount = `${number(row.quantity)} đơn vị`; status = row.status; editable = row; }
  else if (section === 'stock') { const row = item as Stock; title = row.productName; detail = `Lô ${row.batchNumber} · ${row.warehouseName}`; note = `Hạn dùng ${formatDate(row.expiryDate)}`; amount = `${number(row.availableQty)} khả dụng`; }
  else if (section === 'receipts') { const row = item as Receipt; title = row.receiptNumber; detail = row.supplierName; note = formatDate(row.receivedAt); amount = `${number(row.totalQuantity)} đơn vị`; status = row.status; }
  else if (section === 'issues') { const row = item as Issue; title = row.issueNumber; detail = reasons[row.reasonCode] || row.reasonCode; note = formatDate(row.issuedAt); amount = `${number(row.totalQuantity)} đơn vị`; status = row.status; }
  else if (section === 'suppliers') { const row = item as Supplier; title = row.name; detail = row.code; note = row.phone || ''; status = row.status; editable = row; }
  else { const row = item as Movement; title = row.productName; detail = `Lô ${row.batchNumber} · ${movementLabels[row.movementType] || row.movementType}`; note = formatDate(row.postedAt); amount = `${Number(row.quantityDelta) > 0 ? '+' : ''}${number(row.quantityDelta)}`; }
  return <Item role="listitem" className="rounded-none border-0 px-4 py-4"><ItemHeader><ItemContent className="min-w-0"><ItemTitle className="max-w-full truncate">{title}</ItemTitle><ItemDescription className="text-xs">{detail}</ItemDescription></ItemContent>{editable && <ItemActions><EditAction label={title} onClick={() => onEdit(editable)} /></ItemActions>}</ItemHeader><ItemFooter className="w-full justify-between gap-3 text-xs text-muted-foreground"><span className="truncate">{note}</span><span className="shrink-0 font-semibold text-foreground tabular-nums">{amount}</span></ItemFooter>{status && <Status value={status} />}</Item>;
}
