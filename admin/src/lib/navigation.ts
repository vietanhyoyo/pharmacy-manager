import { Activity, ArrowDownLeft, ArrowUpRight, Boxes, LayoutDashboard, Pill, ShoppingBag, Truck, Warehouse } from 'lucide-react';
import type { Section } from './types';

export const navigation: { section: Section; label: string; href: string; icon: typeof Pill }[] = [
  { section: 'dashboard', label: 'Tổng quan', href: '/', icon: LayoutDashboard },
  { section: 'orders', label: 'Đơn hàng web', href: '/orders', icon: ShoppingBag },
  { section: 'products', label: 'Danh mục thuốc', href: '/products', icon: Pill },
  { section: 'lots', label: 'Lô hàng', href: '/lots', icon: Boxes },
  { section: 'stock', label: 'Tồn kho', href: '/stock', icon: Warehouse },
  { section: 'receipts', label: 'Nhập kho', href: '/receipts', icon: ArrowDownLeft },
  { section: 'issues', label: 'Xuất kho', href: '/issues', icon: ArrowUpRight },
  { section: 'suppliers', label: 'Nhà cung cấp', href: '/suppliers', icon: Truck },
  { section: 'movements', label: 'Lịch sử kho', href: '/movements', icon: Activity },
];

export const pageMetadata: Record<Section, { title: string; subtitle: string; listTitle: string; action?: string }> = {
  orders: { title: 'Đơn hàng trực tuyến', subtitle: 'Xác nhận, giao hàng và theo dõi đơn theo từng chi nhánh.', listTitle: 'Danh sách đơn hàng' },
  dashboard: {
    title: 'Tổng quan kho thuốc',
    subtitle: 'Theo dõi hoạt động và sức khỏe kho hàng theo thời gian thực.',
    listTitle: 'Tổng quan',
  },
  products: {
    title: 'Danh mục thuốc',
    subtitle: 'Quản lý thông tin, đơn vị và trạng thái của từng thuốc.',
    listTitle: 'Danh sách thuốc',
    action: 'Thêm thuốc',
  },
  lots: {
    title: 'Lô hàng',
    subtitle: 'Theo dõi số lô, hạn dùng và lượng thuốc theo từng đợt.',
    listTitle: 'Danh sách lô hàng',
    action: 'Thêm lô',
  },
  stock: {
    title: 'Tồn kho',
    subtitle: 'Số lượng thực tế và khả dụng của từng lô trong kho.',
    listTitle: 'Tồn kho theo lô',
  },
  receipts: {
    title: 'Phiếu nhập kho',
    subtitle: 'Ghi nhận thuốc nhập từ các nhà cung cấp.',
    listTitle: 'Danh sách phiếu nhập',
    action: 'Tạo phiếu nhập',
  },
  issues: {
    title: 'Phiếu xuất kho',
    subtitle: 'Ghi nhận sử dụng nội bộ, hao hụt và các lần xuất kho.',
    listTitle: 'Danh sách phiếu xuất',
    action: 'Tạo phiếu xuất',
  },
  suppliers: {
    title: 'Nhà cung cấp',
    subtitle: 'Danh sách đối tác cung cấp thuốc cho nhà thuốc.',
    listTitle: 'Danh sách nhà cung cấp',
    action: 'Thêm nhà cung cấp',
  },
  movements: {
    title: 'Lịch sử kho',
    subtitle: 'Nhật ký biến động số lượng của tất cả thuốc.',
    listTitle: 'Các lần biến động kho',
  },
};

export function sectionForPath(pathname: string): Section {
  return navigation.find(item => item.href === pathname)?.section ?? 'dashboard';
}
