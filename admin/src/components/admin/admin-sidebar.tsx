'use client';

import Link from 'next/link';
import { LogOut, Pill, Settings2, ShieldCheck } from 'lucide-react';
import type { Section } from '@/lib/types';
import { navigation } from '@/lib/navigation';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator, useSidebar } from '@/components/ui/sidebar';

export function AdminSidebar({ section, onPassword, onLogout }: {
  section: Section;
  onPassword: () => void;
  onLogout: () => void;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border bg-sidebar">
      <SidebarHeader className="px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="PharmaFlow" render={<Link href="/" onClick={() => setOpenMobile(false)} />} className="h-12">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Pill className="size-4" /></span>
              <span className="min-w-0"><span className="block truncate text-sm font-semibold leading-tight">PharmaFlow</span><span className="block truncate text-[11px] text-muted-foreground">Quản lý kho thuốc</span></span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup className="pt-5">
          <SidebarGroupLabel className="px-2 text-[11px] font-semibold uppercase tracking-[.12em]">Quản lý</SidebarGroupLabel>
          <SidebarMenu className="mt-2 gap-1">
            {navigation.map(({ section: itemSection, label, href, icon: Icon }) => (
              <SidebarMenuItem key={itemSection}>
                <SidebarMenuButton
                  render={<Link href={href} onClick={() => setOpenMobile(false)} />}
                  isActive={section === itemSection}
                  tooltip={label}
                  className="h-9 px-3 data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-primary/90 data-active:hover:text-primary-foreground"
                >
                  <Icon /><span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-3 px-3 pb-4">
        <div className="rounded-lg border bg-card p-3 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2 text-xs font-medium"><ShieldCheck className="size-4" />Kho đang hoạt động</div>
          <p className="mt-1 text-xs leading-4 text-muted-foreground">Dữ liệu đã đồng bộ với hệ thống.</p>
        </div>
        <SidebarSeparator className="mx-0" />
        <SidebarMenu>
          <SidebarMenuItem><SidebarMenuButton onClick={onPassword} tooltip="Đổi mật khẩu"><Settings2 /><span>Đổi mật khẩu</span></SidebarMenuButton></SidebarMenuItem>
          <SidebarMenuItem><SidebarMenuButton onClick={onLogout} tooltip="Đăng xuất"><LogOut /><span>Đăng xuất</span></SidebarMenuButton></SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
