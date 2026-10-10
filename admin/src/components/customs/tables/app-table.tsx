'use client';

import { Fragment, useState, type Key, type ReactNode } from 'react';
import { Package } from 'lucide-react';
import { Empty as EmptyRoot, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type AppTableHeader = string | { label: string; align?: 'left' | 'right'; className?: string };

type AppTableProps<Row> = {
  headers: AppTableHeader[];
  rows: Row[];
  renderRow: (row: Row) => ReactNode;
  renderMobileRow: (row: Row) => ReactNode;
  getRowKey?: (row: Row, index: number) => Key;
  tableClassName?: string;
  compact?: boolean;
  emptyText?: string;
};

export const number = (value: number | string | null | undefined) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(Number(value ?? 0));
export const money = (value: number | string) => `${number(value)} ₫`;
export const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value)) : '—';

export function EmptyState({ text = 'Chưa có dữ liệu' }: { text?: string }) {
  return <EmptyRoot className="min-h-52"><EmptyHeader><EmptyMedia variant="icon"><Package /></EmptyMedia><EmptyTitle>{text}</EmptyTitle><EmptyDescription>Dữ liệu sẽ xuất hiện tại đây khi được ghi nhận vào hệ thống.</EmptyDescription></EmptyHeader></EmptyRoot>;
}

export function AppTable<Row>({ headers, rows, renderRow, renderMobileRow, getRowKey, tableClassName = 'min-w-[800px]', compact = false, emptyText = 'Không tìm thấy dữ liệu phù hợp' }: AppTableProps<Row>) {
  const [page, setPage] = useState(1);
  const pageSize = compact ? 5 : 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visibleRows = rows.slice(start, start + pageSize);

  function rowKey(row: Row, index: number): Key {
    if (getRowKey) return getRowKey(row, index);
    if (row && typeof row === 'object' && 'id' in row && row.id != null) return String(row.id);
    return index;
  }

  return <>
    <div className="hidden sm:block"><Table className={tableClassName}>
      <TableHeader className="bg-muted/40"><TableRow className="hover:bg-transparent">{headers.map((header, index) => {
        const column = typeof header === 'string' ? { label: header } : header;
        return <TableHead key={`${column.label}-${index}`} scope="col" className={`h-11 px-5 text-[11px] font-semibold uppercase tracking-[.08em] text-muted-foreground ${column.align === 'right' ? 'text-right' : ''} ${column.className ?? ''}`}>{column.label || <span className="sr-only">Thao tác</span>}</TableHead>;
      })}</TableRow></TableHeader>
      <TableBody className="[&_td]:px-5 [&_td]:py-3.5">{visibleRows.length === 0 ? <TableRow><TableCell colSpan={headers.length} className="p-0! px-0! py-0!"><EmptyState text={emptyText} /></TableCell></TableRow> : visibleRows.map((row, index) => <Fragment key={rowKey(row, start + index)}>{renderRow(row)}</Fragment>)}</TableBody>
    </Table></div>
    <div className="sm:hidden">{visibleRows.length === 0 ? <EmptyState text={emptyText} /> : visibleRows.map((row, index) => <Fragment key={rowKey(row, start + index)}>{renderMobileRow(row)}</Fragment>)}</div>
    {!compact && <div className="flex flex-col gap-3 border-t px-5 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>Hiển thị {rows.length ? start + 1 : 0}–{Math.min(start + pageSize, rows.length)} trong {number(rows.length)} mục</span>{totalPages > 1 && <Pagination className="mx-0 w-auto justify-start sm:justify-end"><PaginationContent><PaginationItem><PaginationPrevious href="#" text="Trước" aria-disabled={currentPage === 1} tabIndex={currentPage === 1 ? -1 : 0} onClick={event => { event.preventDefault(); if (currentPage > 1) setPage(currentPage - 1); }} /></PaginationItem>{Array.from({ length: totalPages }, (_, index) => index + 1).map(value => <PaginationItem key={value}><PaginationLink href="#" isActive={value === currentPage} onClick={event => { event.preventDefault(); setPage(value); }}>{value}</PaginationLink></PaginationItem>)}<PaginationItem><PaginationNext href="#" text="Sau" aria-disabled={currentPage === totalPages} tabIndex={currentPage === totalPages ? -1 : 0} onClick={event => { event.preventDefault(); if (currentPage < totalPages) setPage(currentPage + 1); }} /></PaginationItem></PaginationContent></Pagination>}</div>}
  </>;
}
