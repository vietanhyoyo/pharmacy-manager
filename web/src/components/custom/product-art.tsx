import { Pill } from 'lucide-react';

const tones = [
  'from-[#e6f5ed] to-[#d8ede8] text-[#358f7d]',
  'from-[#f8efdf] to-[#f2e5d0] text-[#be9150]',
  'from-[#e7eef9] to-[#dce7f4] text-[#6486b0]',
  'from-[#f5e9ea] to-[#f0dcde] text-[#bb7b83]',
];

export function ProductArt({ sku, imageUrl, large = false }: { sku: string; imageUrl: string | null; large?: boolean }) {
  const tone = tones[sku.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % tones.length];
  return <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${tone} ${large ? 'aspect-square rounded-[2rem]' : 'aspect-[4/3] rounded-2xl'}`}>
    {imageUrl ? <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${imageUrl})` }} role="img" aria-label={`Hình sản phẩm ${sku}`} /> : <>
      <div className="absolute -right-12 -top-12 size-48 rounded-full border border-current/10" />
      <div className="absolute -bottom-16 -left-12 size-56 rounded-full border border-current/10" />
      <div className={`relative flex flex-col items-center gap-4 rounded-2xl bg-white/75 shadow-[0_18px_40px_rgba(31,71,62,.12)] ${large ? 'px-14 py-16' : 'px-9 py-10'}`}>
        <Pill className={large ? 'size-20' : 'size-12'} strokeWidth={1.4} />
        <span className="text-[10px] font-bold tracking-[.25em] uppercase">AN TÂM PHARMACY</span>
      </div>
    </>}
  </div>;
}
