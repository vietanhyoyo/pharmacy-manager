'use client';

import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Boxes, Package, Pencil, Pill, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty as EmptyRoot, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemTitle } from '@/components/ui/item';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Issue, Lot, Movement, Product, Receipt, Section, Stock, Supplier } from '@/lib/types';

export const number = (value: number | string | null | undefined) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(Number(value ?? 0));
export const money = (value: number | string) => `${number(value)} ₫`;
export const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value)) : '—';
const isExpiring = (value?: string | null) => !!value && new Date(value).getTime() < Date.now() + 90 * 86400000;

export function Status({ value }: { value: string }) {
  const labels: Record<string, string> = { ACTIVE: 'Đang hoạt động', INACTIVE: 'Ngừng hoạt động', POSTED: 'Đã ghi sổ', BLOCKED: 'Đã khóa', QUARANTINED: 'Cách ly', CLOSED: 'Đã đóng' };
  const active = value === 'ACTIVE' || value === 'POSTED';
  return <Badge variant={active ? 'outline' : 'secondary'} className="gap-1.5 px-2.5 py-1 text-[11px] font-medium"><span className={`size-1.5 rounded-full ${active ? 'bg-foreground' : 'bg-muted-foreground'}`} />{labels[value] || value}</Badge>;
}

export function EmptyState({ text = 'Chưa có dữ liệu' }: { text?: string }) {
  return <EmptyRoot className="min-h-52"><EmptyHeader><EmptyMedia variant="icon"><Package /></EmptyMedia><EmptyTitle>{text}</EmptyTitle><EmptyDescription>Dữ liệu sẽ xuất hiện tại đây khi được ghi nhận vào hệ thống.</EmptyDescription></EmptyHeader></EmptyRoot>;
}

const headers: Record<Section, string[]> = {
  dashboard: [], products: ['Thuốc', 'Nhóm / dạng', 'Đơn vị', 'Tồn kho', 'Trạng thái', ''],
  lots: ['Thuốc', 'Số lô', 'Hạn dùng', 'Tồn kho', 'Trạng thái', ''],
  stock: ['Thuốc', 'Lô / hạn dùng', 'Kho', 'Tồn thực tế', 'Khả dụng'],
  receipts: ['Mã phiếu', 'Nhà cung cấp', 'Ngày nhập', 'Số dòng', 'Số lượng', 'Giá trị', 'Trạng thái'],
  issues: ['Mã phiếu', 'Lý do', 'Ngày xuất', 'Số dòng', 'Số lượng', 'Trạng thái'],
  suppliers: ['Nhà cung cấp', 'Liên hệ', 'Trạng thái', ''],
  movements: ['Thời gian', 'Thuốc / lô', 'Loại biến động', 'Số lượng', 'Mã chứng từ'],
};
const reasons: Record<string, string> = { INTERNAL_USE: 'Sử dụng nội bộ', DAMAGED: 'Hư hỏng', EXPIRED: 'Hết hạn', SAMPLE: 'Hàng mẫu', OTHER: 'Khác' };
const movementLabels: Record<string, string> = { PURCHASE_RECEIPT: 'Nhập kho', INTERNAL_USE: 'Xuất kho', DAMAGE: 'Hư hỏng', EXPIRY: 'Hết hạn' };

function Identity({ icon: Icon, title, detail }: { icon: typeof Pill; title: string; detail: string }) {
  return <div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground"><Icon className="size-4" /></span><div className="min-w-0 flex-1"><div className="truncate font-medium text-foreground" title={title}>{title}</div><div className="mt-0.5 truncate text-xs text-muted-foreground" title={detail}>{detail}</div></div></div>;
}

function EditAction({ label, onClick }: { label: string; onClick: () => void }) {
  return <Button variant="ghost" size="icon-sm" aria-label={`Chỉnh sửa ${label}`} title={`Chỉnh sửa ${label}`} onClick={onClick}><Pencil className="size-3.5" /></Button>;
}

function DataRow({ section, item, onEdit }: { section: Section; item: unknown; onEdit: (row: Product | Lot | Supplier) => void }) {
  if (section === 'products') {
    const row = item as Product;
    return <TableRow key={row.id}><TableCell><Identity icon={Pill} title={row.name} detail={`${row.sku} · ${row.activeIngredient || 'Chưa có hoạt chất'}`} /></TableCell><TableCell><div className="truncate font-medium" title={row.categoryName || 'Chưa phân nhóm'}>{row.categoryName || 'Chưa phân nhóm'}</div><div className="mt-0.5 truncate text-xs text-muted-foreground">{row.dosageForm || '—'}</div></TableCell><TableCell>{row.unitName}</TableCell><TableCell className="text-right font-semibold tabular-nums">{number(row.quantity)}</TableCell><TableCell><Status value={row.status} /></TableCell><TableCell className="text-right"><EditAction label={row.name} onClick={() => onEdit(row)} /></TableCell></TableRow>;
  }
  if (section === 'lots') {
    const row = item as Lot;
    return <TableRow key={row.id}><TableCell><Identity icon={Boxes} title={row.productName} detail={row.sku} /></TableCell><TableCell><Badge variant="outline" className="rounded-md font-mono">{row.batchNumber}</Badge></TableCell><TableCell><div className={isExpiring(row.expiryDate) ? 'font-medium' : ''}>{formatDate(row.expiryDate)}</div>{isExpiring(row.expiryDate) && <div className="mt-0.5 text-xs text-muted-foreground">Sắp hết hạn</div>}</TableCell><TableCell className="text-right font-semibold tabular-nums">{number(row.quantity)}</TableCell><TableCell><Status value={row.status} /></TableCell><TableCell className="text-right"><EditAction label={row.batchNumber} onClick={() => onEdit(row)} /></TableCell></TableRow>;
  }
  if (section === 'stock') {
    const row = item as Stock;
    return <TableRow key={`${row.productId}-${row.lotId}`}><TableCell><Identity icon={Pill} title={row.productName} detail={row.sku} /></TableCell><TableCell><div className="font-mono text-xs font-medium">{row.batchNumber}</div><div className="mt-0.5 text-xs text-muted-foreground">HSD {formatDate(row.expiryDate)}</div></TableCell><TableCell>{row.warehouseName}</TableCell><TableCell className="text-right tabular-nums">{number(row.onHandQty)}</TableCell><TableCell className="text-right font-semibold tabular-nums">{number(row.availableQty)}</TableCell></TableRow>;
  }
  if (section === 'receipts') {
    const row = item as Receipt;
    return <TableRow key={row.id}><TableCell><Identity icon={ArrowDownLeft} title={row.receiptNumber} detail="Phiếu nhập kho" /></TableCell><TableCell className="font-medium">{row.supplierName}</TableCell><TableCell>{formatDate(row.receivedAt)}</TableCell><TableCell className="text-right tabular-nums">{number(row.lineCount)}</TableCell><TableCell className="text-right font-semibold tabular-nums">{number(row.totalQuantity)}</TableCell><TableCell className="text-right tabular-nums">{money(row.totalAmount)}</TableCell><TableCell><Status value={row.status} /></TableCell></TableRow>;
  }
  if (section === 'issues') {
    const row = item as Issue;
    return <TableRow key={row.id}><TableCell><Identity icon={ArrowUpRight} title={row.issueNumber} detail="Phiếu xuất kho" /></TableCell><TableCell>{reasons[row.reasonCode] || row.reasonCode}</TableCell><TableCell>{formatDate(row.issuedAt)}</TableCell><TableCell className="text-right tabular-nums">{number(row.lineCount)}</TableCell><TableCell className="text-right font-semibold tabular-nums">{number(row.totalQuantity)}</TableCell><TableCell><Status value={row.status} /></TableCell></TableRow>;
  }
  if (section === 'suppliers') {
    const row = item as Supplier;
    return <TableRow key={row.id}><TableCell><Identity icon={Truck} title={row.name} detail={row.code} /></TableCell><TableCell>{row.phone || '—'}</TableCell><TableCell><Status value={row.status} /></TableCell><TableCell className="text-right"><EditAction label={row.name} onClick={() => onEdit(row)} /></TableCell></TableRow>;
  }
  const row = item as Movement;
  const positive = Number(row.quantityDelta) > 0;
  return <TableRow key={row.id}><TableCell>{formatDate(row.postedAt)}</TableCell><TableCell><Identity icon={positive ? ArrowDownLeft : ArrowUpRight} title={row.productName} detail={row.batchNumber} /></TableCell><TableCell><Badge variant="secondary">{movementLabels[row.movementType] || row.movementType}</Badge></TableCell><TableCell className="text-right font-semibold tabular-nums">{positive ? '+' : ''}{number(row.quantityDelta)}</TableCell><TableCell className="font-mono text-xs">{row.referenceNo || '—'}</TableCell></TableRow>;
}

function MobileRow({ section, item, onEdit }: { section: Section; item: unknown; onEdit: (row: Product | Lot | Supplier) => void }) {
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

export function AppTable({ section, rows, onEdit, compact = false }: { section: Section; rows: unknown[]; onEdit: (row: Product | Lot | Supplier) => void; compact?: boolean }) {
  const [page, setPage] = useState(1);
  const pageSize = compact ? 5 : 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visibleRows = rows.slice(start, start + pageSize);
  const lastHeader = headers[section].length - 1;
  const productWidths = ['w-[30%]', 'w-[23%]', 'w-[10%]', 'w-[11%]', 'w-[18%]', 'w-[8%]'];
  return <>
    <div className="hidden sm:block"><Table className={section === 'products' ? 'min-w-[800px] table-fixed' : section === 'suppliers' ? 'min-w-[620px]' : 'min-w-[800px]'}>
      <TableHeader className="bg-muted/40"><TableRow className="hover:bg-transparent">{headers[section].map((label, index) => <TableHead key={`${label}-${index}`} scope="col" className={`h-11 px-5 text-[11px] font-semibold uppercase tracking-[.08em] text-muted-foreground ${['Tồn kho', 'Tồn thực tế', 'Khả dụng', 'Số dòng', 'Số lượng', 'Giá trị'].includes(label) ? 'text-right' : ''} ${section === 'products' ? productWidths[index] : index === lastHeader && !label ? 'w-14' : ''}`}>{label || <span className="sr-only">Thao tác</span>}</TableHead>)}</TableRow></TableHeader>
      <TableBody className="[&_td]:px-5 [&_td]:py-3.5">{visibleRows.length === 0 ? <TableRow><TableCell colSpan={headers[section].length} className="p-0! px-0! py-0!"><EmptyState text="Không tìm thấy dữ liệu phù hợp" /></TableCell></TableRow> : visibleRows.map((item, index) => <DataRow key={(item as { id?: string }).id || `${section}-${index}`} section={section} item={item} onEdit={onEdit} />)}</TableBody>
    </Table></div>
    <div className="sm:hidden">{visibleRows.length === 0 ? <EmptyState text="Không tìm thấy dữ liệu phù hợp" /> : <ItemGroup className="gap-0 divide-y">{visibleRows.map((item, index) => <MobileRow key={(item as { id?: string }).id || `${section}-${index}`} section={section} item={item} onEdit={onEdit} />)}</ItemGroup>}</div>
    {!compact && <div className="flex flex-col gap-3 border-t px-5 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>Hiển thị {rows.length ? start + 1 : 0}–{Math.min(start + pageSize, rows.length)} trong {number(rows.length)} mục</span>{totalPages > 1 && <Pagination className="mx-0 w-auto justify-start sm:justify-end"><PaginationContent><PaginationItem><PaginationPrevious href="#" text="Trước" aria-disabled={currentPage === 1} tabIndex={currentPage === 1 ? -1 : 0} onClick={event => { event.preventDefault(); if (currentPage > 1) setPage(currentPage - 1); }} /></PaginationItem>{Array.from({ length: totalPages }, (_, index) => index + 1).map(value => <PaginationItem key={value}><PaginationLink href="#" isActive={value === currentPage} onClick={event => { event.preventDefault(); setPage(value); }}>{value}</PaginationLink></PaginationItem>)}<PaginationItem><PaginationNext href="#" text="Sau" aria-disabled={currentPage === totalPages} tabIndex={currentPage === totalPages ? -1 : 0} onClick={event => { event.preventDefault(); if (currentPage < totalPages) setPage(currentPage + 1); }} /></PaginationItem></PaginationContent></Pagination>}</div>}
  </>;
}
