import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CartProvider } from '@/components/custom/cart-provider';
import { SiteHeader } from '@/components/custom/site-header';
import { SiteFooter } from '@/components/custom/site-footer';
import './globals.css';

const geist = Geist({ subsets: ['latin', 'vietnamese'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: { default: 'Nhà thuốc An Tâm', template: '%s | Nhà thuốc An Tâm' },
  description: 'Mua sản phẩm chăm sóc sức khỏe tại Nhà thuốc An Tâm.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="vi" className={geist.variable}><body className="min-h-screen bg-[#f8faf7] text-[#17382b] antialiased"><TooltipProvider><CartProvider><SiteHeader />{children}<SiteFooter /></CartProvider></TooltipProvider></body></html>;
}
