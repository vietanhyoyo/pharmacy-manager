import Link from 'next/link';
import { HeartPulse, MapPin, Phone, ShieldCheck } from 'lucide-react';

export function SiteFooter() {
  return <footer className="mt-20 bg-[#133e31] text-[#d6e9dc]">
    <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-3 lg:px-8">
      <div><div className="mb-5 flex items-center gap-3 text-white"><HeartPulse /><strong className="text-2xl">An Tâm Pharmacy</strong></div><p className="max-w-sm text-sm leading-7 text-[#bdd6c6]">Sản phẩm chăm sóc sức khỏe được lựa chọn cẩn thận. Mỗi đơn hàng được nhà thuốc xác nhận trước khi giao.</p></div>
      <div><h3 className="mb-5 font-semibold text-white">Khám phá</h3><div className="flex flex-col gap-3 text-sm"><Link href="/products" className="hover:text-white">Tất cả sản phẩm</Link><Link href="/cart" className="hover:text-white">Giỏ hàng</Link><Link href="/" className="hover:text-white">Trang chủ</Link></div></div>
      <div><h3 className="mb-5 font-semibold text-white">Thông tin nhà thuốc</h3><div className="space-y-3 text-sm"><p className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 shrink-0" />12 Nguyễn Huệ, Quận 1, TP.HCM</p><p className="flex items-center gap-3"><Phone className="size-4" />Liên hệ trực tiếp tại nhà thuốc</p><p className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0" />Thông tin sản phẩm chỉ để tham khảo, không thay thế tư vấn y tế.</p></div></div>
    </div>
    <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-[#a9c7b5]">© {new Date().getFullYear()} Nhà thuốc An Tâm</div>
  </footer>;
}
