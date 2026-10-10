import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { money } from '@/lib/format';

export default async function OrderSuccess({ searchParams }: { searchParams: Promise<{ number?: string; total?: string }> }) {
  const { number, total } = await searchParams;
  const amount = Number(total);
  return <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 py-20 text-center"><div className="flex size-24 items-center justify-center rounded-full bg-[#e3f3e8] text-[#25835d]"><Check className="size-12" strokeWidth={2.2} /></div><span className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#3b9169]">Đặt hàng thành công</span><h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#183f30]">Cảm ơn bạn đã tin tưởng An Tâm</h1><p className="mt-5 max-w-xl leading-7 text-[#6d806f]">Nhà thuốc đã nhận yêu cầu và sẽ liên hệ để xác nhận đơn hàng trước khi giao. Vui lòng giữ điện thoại để nhận cuộc gọi.</p><Card className="mt-9 w-full items-start rounded-[1.75rem] border-[#dfe9df] bg-white p-8 text-left"><p className="text-sm text-[#7a8b7b]">Mã đơn hàng</p><p className="mt-1 text-xl font-bold text-[#225d43]">{number || 'Đang cập nhật'}</p>{Number.isFinite(amount) && amount > 0 && <><Separator className="my-5" /><p className="text-sm text-[#68806d]">Tổng tiền: <strong className="text-[#236847]">{money(amount)}</strong></p></>}</Card><Button asChild className="mt-9 rounded-full bg-[#1d7658] px-7 hover:bg-[#16583f]"><Link href="/products">Tiếp tục khám phá <ArrowRight className="size-4" /></Link></Button></main>;
}
