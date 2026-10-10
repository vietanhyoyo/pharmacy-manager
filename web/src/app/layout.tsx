import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CartProvider } from '@/components/custom/cart-provider';
import { SiteHeader } from '@/components/custom/site-header';
import { SiteFooter } from '@/components/custom/site-footer';
import './globals.css';

const roboto = Roboto({ subsets: ['latin', 'vietnamese'], variable: '--font-roboto', weight: ['300', '400', '500', '600', '700', '800', '900'] });

export const metadata: Metadata = {
  title: { default: 'Nhà thuốc An Tâm', template: '%s | Nhà thuốc An Tâm' },
  description: 'Mua sản phẩm chăm sóc sức khỏe tại Nhà thuốc An Tâm.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="vi" className={roboto.variable}><body className="min-h-screen bg-background text-foreground antialiased"><TooltipProvider><CartProvider><SiteHeader />{children}<SiteFooter /></CartProvider></TooltipProvider></body></html>;
}
