'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { navigation } from '@/lib/navigation';
import type { Section } from '@/lib/types';
import type { AdminUser } from '@/lib/api/res/auth.res';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { lookupsApiState } from '@/lib/state/lookups-api-state';
import { useAdminStore } from '@/lib/store';
import { useStore } from 'zustand';

export function AdminHeader({ section, user }: { section: Section; user: AdminUser }) {
  const label = navigation.find(item => item.section === section)?.label ?? 'Tổng quan';
  const lookups = useStore(lookupsApiState.store, state => state.data);
  const selectedWarehouseId = useAdminStore(state => state.selectedWarehouseId);
  const setSelectedWarehouseId = useAdminStore(state => state.setSelectedWarehouseId);
  const selectedWarehouse = lookups?.warehouses.find(warehouse => warehouse.id === selectedWarehouseId);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-7">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger aria-label="Thu gọn hoặc mở menu" />
        <Separator orientation="vertical" className="h-5" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink render={<Link href="/" />}>Quản lý kho</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage className="max-w-[180px] truncate font-medium">{section === 'dashboard' ? 'Tổng quan' : label}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {section !== 'orders' && <div className="hidden items-center gap-2 lg:flex">
          <span className="text-xs text-muted-foreground">Kho đang xem</span>
          <Select items={lookups?.warehouses.map(warehouse => ({ value: warehouse.id, label: `${warehouse.branchName ? `${warehouse.branchName} · ` : ''}${warehouse.name}` })) ?? []} value={selectedWarehouseId} onValueChange={value => {
            if (!value) return;
            setSelectedWarehouseId(value);
            localStorage.setItem('pharmacy-manager:selected-warehouse', value);
          }}>
            <SelectTrigger aria-label="Chọn kho quản lý" className="h-9 w-[240px] max-w-[32vw] text-sm">
              <SelectValue placeholder="Chọn kho">{selectedWarehouse ? `${selectedWarehouse.branchName ? `${selectedWarehouse.branchName} · ` : ''}${selectedWarehouse.name}` : undefined}</SelectValue>
            </SelectTrigger>
            <SelectContent align="end" alignItemWithTrigger={false} className="min-w-[420px]">
              {lookups?.warehouses.map(warehouse => <SelectItem key={warehouse.id} value={warehouse.id}>{warehouse.branchName ? `${warehouse.branchName} · ` : ''}{warehouse.name} <span className="text-muted-foreground">({warehouse.code})</span></SelectItem>)}
            </SelectContent>
          </Select>
        </div>}
        <Badge variant="outline" className="hidden gap-1.5 sm:inline-flex"><span className="size-1.5 rounded-full bg-foreground" />Trực tuyến</Badge>
        <Separator orientation="vertical" className="hidden h-6 sm:block" />
        <Avatar><AvatarFallback className="font-semibold text-foreground">{user.fullName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
        <div className="hidden leading-tight sm:block"><div className="text-xs font-semibold">{user.fullName}</div><div className="text-[11px] text-muted-foreground">Quản trị viên</div></div>
      </div>
    </header>
  );
}
