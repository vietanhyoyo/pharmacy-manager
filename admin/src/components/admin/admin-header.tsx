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

export function AdminHeader({ section, user }: { section: Section; user: AdminUser }) {
  const label = navigation.find(item => item.section === section)?.label ?? 'Tổng quan';

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
        <Badge variant="outline" className="hidden gap-1.5 sm:inline-flex"><span className="size-1.5 rounded-full bg-foreground" />Trực tuyến</Badge>
        <Separator orientation="vertical" className="hidden h-6 sm:block" />
        <Avatar><AvatarFallback className="font-semibold text-foreground">{user.fullName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
        <div className="hidden leading-tight sm:block"><div className="text-xs font-semibold">{user.fullName}</div><div className="text-[11px] text-muted-foreground">Quản trị viên</div></div>
      </div>
    </header>
  );
}
