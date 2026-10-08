'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, ArrowDownLeft, ArrowRight, ArrowUpRight, Boxes, ClipboardList, LayoutDashboard, LogOut, Pill, Plus, RefreshCw, Search, Settings2, ShieldCheck, Truck, Warehouse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Separator } from '@/components/ui/separator';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarSeparator, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { useAdminStore } from '@/lib/store';
import { Dashboard, Lot, Product, Section, Supplier, User } from '@/lib/types';
import { EditorDialog, PasswordDialog } from './editor-dialog';
import { AppTable, EmptyState, formatDate, number } from './inventory-table';

const navigation = [
  { section: 'dashboard' as Section, label: 'Tổng quan', icon: LayoutDashboard },
  { section: 'products' as Section, label: 'Danh mục thuốc', icon: Pill },
  { section: 'lots' as Section, label: 'Lô hàng', icon: Boxes },
  { section: 'stock' as Section, label: 'Tồn kho', icon: Warehouse },
  { section: 'receipts' as Section, label: 'Nhập kho', icon: ArrowDownLeft },
  { section: 'issues' as Section, label: 'Xuất kho', icon: ArrowUpRight },
  { section: 'suppliers' as Section, label: 'Nhà cung cấp', icon: Truck },
  { section: 'movements' as Section, label: 'Lịch sử kho', icon: Activity },
];
const titles: Record<Section, { title: string; subtitle: string; action?: string }> = {
  dashboard: { title: 'Tổng quan kho thuốc', subtitle: 'Theo dõi hoạt động và sức khỏe kho hàng theo thời gian thực.' },
  products: { title: 'Danh mục thuốc', subtitle: 'Quản lý thông tin, đơn vị và trạng thái của từng thuốc.', action: 'Thêm thuốc' },
  lots: { title: 'Lô hàng', subtitle: 'Theo dõi số lô, hạn dùng và lượng thuốc theo từng đợt.', action: 'Thêm lô' },
  stock: { title: 'Tồn kho', subtitle: 'Số lượng thực tế và khả dụng của từng lô trong kho.' },
  receipts: { title: 'Phiếu nhập kho', subtitle: 'Ghi nhận thuốc nhập từ các nhà cung cấp.', action: 'Tạo phiếu nhập' },
  issues: { title: 'Phiếu xuất kho', subtitle: 'Ghi nhận sử dụng nội bộ, hao hụt và các lần xuất kho.', action: 'Tạo phiếu xuất' },
  suppliers: { title: 'Nhà cung cấp', subtitle: 'Danh sách đối tác cung cấp thuốc cho nhà thuốc.', action: 'Thêm nhà cung cấp' },
  movements: { title: 'Lịch sử kho', subtitle: 'Nhật ký biến động số lượng của tất cả thuốc.' },
};
const endpoint: Record<Section, string> = { dashboard: 'dashboard', products: 'products', lots: 'lots', stock: 'stock', receipts: 'receipts', issues: 'issues', suppliers: 'suppliers', movements: 'movements' };
const listTitles: Partial<Record<Section, string>> = { products: 'Danh sách thuốc', lots: 'Danh sách lô hàng', stock: 'Tồn kho theo lô', receipts: 'Danh sách phiếu nhập', issues: 'Danh sách phiếu xuất', suppliers: 'Danh sách nhà cung cấp', movements: 'Các lần biến động kho' };

function AdminSidebar({ section, onPassword, onLogout }: { section: Section; onPassword: () => void; onLogout: () => void }) {
  const { setOpenMobile } = useSidebar();
  return <Sidebar collapsible="icon" className="border-sidebar-border bg-sidebar">
    <SidebarHeader className="px-3 py-4"><SidebarMenu><SidebarMenuItem><SidebarMenuButton size="lg" tooltip="PharmaFlow" render={<Link href="/" onClick={() => setOpenMobile(false)} />} className="h-12"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Pill className="size-4" /></span><span className="min-w-0"><span className="block truncate text-sm font-semibold leading-tight">PharmaFlow</span><span className="block truncate text-[11px] text-muted-foreground">Quản lý kho thuốc</span></span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarHeader>
    <SidebarSeparator />
    <SidebarContent><SidebarGroup className="pt-5"><SidebarGroupLabel className="px-2 text-[11px] font-semibold uppercase tracking-[.12em]">Quản lý</SidebarGroupLabel><SidebarMenu className="mt-2 gap-1">{navigation.map(link => { const Icon = link.icon; return <SidebarMenuItem key={link.section}><SidebarMenuButton render={<Link href={link.section === 'dashboard' ? '/' : `/${link.section}`} onClick={() => setOpenMobile(false)} />} isActive={section === link.section} tooltip={link.label} className="h-9 px-3 data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-primary/90"><Icon /><span>{link.label}</span></SidebarMenuButton></SidebarMenuItem>; })}</SidebarMenu></SidebarGroup></SidebarContent>
    <SidebarFooter className="gap-3 px-3 pb-4"><div className="rounded-lg border bg-card p-3 group-data-[collapsible=icon]:hidden"><div className="flex items-center gap-2 text-xs font-medium"><ShieldCheck className="size-4" /> Kho đang hoạt động</div><p className="mt-1 text-xs leading-4 text-muted-foreground">Dữ liệu đã đồng bộ với hệ thống.</p></div><SidebarSeparator className="mx-0" /><SidebarMenu><SidebarMenuItem><SidebarMenuButton onClick={onPassword} tooltip="Đổi mật khẩu"><Settings2 /><span>Đổi mật khẩu</span></SidebarMenuButton></SidebarMenuItem><SidebarMenuItem><SidebarMenuButton onClick={onLogout} tooltip="Đăng xuất"><LogOut /><span>Đăng xuất</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarFooter>
  </Sidebar>;
}

function DashboardView({ data }: { data: Dashboard }) {
  const cards = [
    { label: 'Tổng số thuốc', value: data.products, icon: Pill, hint: 'Sản phẩm trong danh mục' },
    { label: 'Tồn kho hiện tại', value: data.totalUnits, icon: Warehouse, hint: 'Đơn vị thuốc đang lưu kho' },
    { label: 'Lô hàng', value: data.lots, icon: Boxes, hint: 'Đang được theo dõi' },
    { label: 'Phiếu đã xử lý', value: Number(data.receipts) + Number(data.issues), icon: ClipboardList, hint: `${data.receipts} nhập · ${data.issues} xuất` },
  ];
  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(card => <Card key={card.label} className="bg-card"><CardHeader><CardTitle className="text-sm text-muted-foreground">{card.label}</CardTitle><CardAction><span className="flex size-9 items-center justify-center rounded-lg border bg-muted/50"><card.icon className="size-4" /></span></CardAction></CardHeader><CardContent><div className="text-3xl font-semibold tracking-tight tabular-nums">{number(card.value)}</div><p className="mt-1 text-xs text-muted-foreground">{card.hint}</p></CardContent></Card>)}</div>
    <div className="grid gap-5 xl:grid-cols-2">
      <Card><CardHeader className="border-b"><CardTitle>Sắp hết hạn</CardTitle><CardDescription>Lô thuốc cần được chú ý trong 90 ngày tới</CardDescription><CardAction><Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/lots" />}>Xem tất cả <ArrowRight /></Button></CardAction></CardHeader><CardContent className="p-0">{data.expiring.length ? <div className="divide-y">{data.expiring.map(row => <div key={row.id} className="flex items-center justify-between gap-4 px-4 py-3.5"><div><div className="text-sm font-medium">{row.productName}</div><div className="mt-1 font-mono text-xs text-muted-foreground">{row.batchNumber} · {number(row.quantity)} đơn vị</div></div><Badge variant="secondary" className="h-auto rounded-md py-1.5">{formatDate(row.expiryDate)}</Badge></div>)}</div> : <EmptyState text="Không có lô sắp hết hạn" />}</CardContent></Card>
      <Card><CardHeader className="border-b"><CardTitle>Tồn kho thấp</CardTitle><CardDescription>Thuốc còn dưới 30 đơn vị</CardDescription><CardAction><Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/stock" />}>Xem tồn kho <ArrowRight /></Button></CardAction></CardHeader><CardContent className="p-0">{data.lowStock.length ? <div className="divide-y">{data.lowStock.map(row => <div key={row.id} className="flex items-center justify-between gap-4 px-4 py-3.5"><div><div className="text-sm font-medium">{row.name}</div><div className="mt-1 font-mono text-xs text-muted-foreground">{row.sku}</div></div><div className="text-sm font-semibold tabular-nums">{number(row.quantity)} <span className="text-xs font-normal text-muted-foreground">còn lại</span></div></div>)}</div> : <EmptyState text="Tồn kho đang ổn định" />}</CardContent></Card>
    </div>
    <Card><CardHeader className="border-b"><CardTitle>Biến động gần đây</CardTitle><CardDescription>Những lần nhập và xuất kho mới nhất</CardDescription><CardAction><Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/movements" />}>Xem lịch sử <ArrowRight /></Button></CardAction></CardHeader><CardContent className="p-0"><AppTable section="movements" rows={data.recent} onEdit={() => {}} compact /></CardContent></Card>
  </div>;
}

export function AdminApp({ section }: { section: Section }) {
  const router = useRouter();
  const user = useAdminStore(state => state.user);
  const setUser = useAdminStore(state => state.setUser);
  const loadLookups = useAdminStore(state => state.loadLookups);
  const revision = useAdminStore(state => state.revision);
  const refresh = useAdminStore(state => state.refresh);
  const [loaded, setLoaded] = useState<{ key: string; data: unknown[] | Dashboard | null; error: string } | null>(null);
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<{ section: Section; item?: Product | Lot | Supplier } | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const requestKey = `${section}:${revision}`;
  const loading = loaded?.key !== requestKey;
  const data = loading ? null : loaded?.data;
  const error = loading ? '' : loaded.error;

  useEffect(() => {
    let active = true;
    api<User>('auth/me').then(found => { if (active) { setUser(found); void loadLookups(); } }).catch(() => { if (active) router.replace('/login'); });
    return () => { active = false; };
  }, [router, setUser, loadLookups]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    api<unknown[] | Dashboard>(`admin/${endpoint[section]}`).then(result => { if (active) setLoaded({ key: requestKey, data: result, error: '' }); }).catch(cause => { if (active) setLoaded({ key: requestKey, data: null, error: cause.message }); });
    return () => { active = false; };
  }, [section, revision, user, requestKey]);

  const rows = useMemo(() => Array.isArray(data) ? data.filter(row => JSON.stringify(row).toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))) : [], [data, search]);
  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); setUser(null); router.replace('/login'); }
  if (!user) return <div className="flex min-h-screen items-center justify-center gap-3 text-sm text-muted-foreground"><Skeleton className="size-5 rounded-full" /> Đang tải bảng điều khiển...</div>;

  return <SidebarProvider className="bg-background">
    <AdminSidebar section={section} onPassword={() => setPasswordOpen(true)} onLogout={logout} />
    <SidebarInset className="min-w-0">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-7">
        <div className="flex min-w-0 items-center gap-3"><SidebarTrigger aria-label="Thu gọn hoặc mở menu" /><Separator orientation="vertical" className="h-5" /><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink render={<Link href="/" />}>Quản lý kho</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage className="max-w-[180px] truncate font-medium">{section === 'dashboard' ? 'Tổng quan' : navigation.find(x => x.section === section)?.label}</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb></div>
        <div className="flex shrink-0 items-center gap-3"><Badge variant="outline" className="hidden gap-1.5 sm:inline-flex"><span className="size-1.5 rounded-full bg-foreground" />Trực tuyến</Badge><Separator orientation="vertical" className="hidden h-6 sm:block" /><Avatar><AvatarFallback className="font-semibold text-foreground">{user.fullName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div className="hidden leading-tight sm:block"><div className="text-xs font-semibold">{user.fullName}</div><div className="text-[11px] text-muted-foreground">Quản trị viên</div></div></div>
      </header>
      <div className="mx-auto w-full max-w-[1500px] px-4 pb-12 pt-7 md:px-7 md:pt-9">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div className="min-w-0"><p className="mb-2 text-xs font-medium text-muted-foreground">Tổng quan / {section === 'dashboard' ? 'Kho thuốc' : navigation.find(x => x.section === section)?.label}</p><h1 className="text-3xl font-semibold tracking-tight md:text-[34px]">{titles[section].title}</h1><p className="mt-2 text-sm text-muted-foreground">{titles[section].subtitle}</p></div>{titles[section].action && <Button size="lg" onClick={() => setEditor({ section })}><Plus />{titles[section].action}</Button>}</div>
        {error && <div role="alert" className="mb-5 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"><span>{error}</span><Button variant="ghost" size="sm" onClick={refresh}>Thử lại</Button></div>}
        {loading ? <div className="space-y-4"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}</div><Skeleton className="h-80 rounded-xl" /></div> : section === 'dashboard' && data && !Array.isArray(data) ? <DashboardView data={data as Dashboard} /> : <Card className="gap-0"><CardHeader className="border-b pb-4"><CardTitle>{listTitles[section] || 'Danh sách'}</CardTitle><CardDescription>Tra cứu và theo dõi dữ liệu trong kho thuốc</CardDescription><CardAction><Badge variant="secondary">{number(rows.length)} mục</Badge></CardAction></CardHeader><CardContent className="p-0"><div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between"><InputGroup className="max-w-md"><InputGroupAddon><Search className="size-4" /></InputGroupAddon><InputGroupInput aria-label="Tìm kiếm trong danh sách" placeholder="Tìm kiếm trong danh sách..." value={search} onChange={event => setSearch(event.target.value)} /></InputGroup><Button variant="outline" onClick={refresh}><RefreshCw />Làm mới</Button></div><AppTable key={section} section={section} rows={rows} onEdit={item => setEditor({ section, item })} /></CardContent></Card>}
        <footer className="mt-8 flex items-center justify-between border-t pt-5 text-xs text-muted-foreground"><span>© 2026 PharmaFlow</span><span>Quản lý kho thuốc</span></footer>
      </div>
    </SidebarInset>
    <EditorDialog key={`${editor?.section}-${editor?.item?.id || 'new'}`} editor={editor} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); refresh(); void loadLookups(); }} />
    <PasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
  </SidebarProvider>;
}
