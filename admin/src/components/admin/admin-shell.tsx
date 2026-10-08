'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminHeader } from './admin-header';
import { AdminSidebar } from './admin-sidebar';
import { PasswordDialog } from '@/components/dialogs/password-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getCurrentAdmin, logout as logoutAdmin } from '@/lib/api/auth.api';
import { sectionForPath } from '@/lib/navigation';
import { useAdminStore } from '@/lib/store';

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAdminStore(state => state.user);
  const setUser = useAdminStore(state => state.setUser);
  const loadLookups = useAdminStore(state => state.loadLookups);
  const [sessionReady, setSessionReady] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const section = sectionForPath(pathname);

  useEffect(() => {
    let active = true;
    getCurrentAdmin()
      .then(currentUser => {
        if (!active) return;
        setUser(currentUser);
        void loadLookups().catch(() => undefined);
      })
      .catch(() => {
        if (active) router.replace('/login');
      })
      .finally(() => {
        if (active) setSessionReady(true);
      });

    return () => { active = false; };
  }, [loadLookups, router, setUser]);

  async function logout() {
    try {
      await logoutAdmin();
    } finally {
      setUser(null);
      router.replace('/login');
    }
  }

  if (!sessionReady || !user) {
    return <div className="flex min-h-screen items-center justify-center gap-3 text-sm text-muted-foreground"><Skeleton className="size-5 rounded-full" />Đang tải bảng điều khiển...</div>;
  }

  return (
    <SidebarProvider className="bg-background">
      <AdminSidebar section={section} onPassword={() => setPasswordOpen(true)} onLogout={() => { void logout().catch(() => undefined); }} />
      <SidebarInset className="min-w-0">
        <AdminHeader section={section} user={user} />
        <main className="mx-auto w-full max-w-[1500px] px-4 pb-12 pt-7 md:px-7 md:pt-9">{children}</main>
        <footer className="mt-auto flex items-center justify-between border-t px-4 py-5 text-xs text-muted-foreground md:px-7"><span>© 2026 PharmaFlow</span><span>Quản lý kho thuốc</span></footer>
      </SidebarInset>
      <PasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
    </SidebarProvider>
  );
}
