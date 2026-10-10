import { Pill } from 'lucide-react';

export function ProductArt({ sku, imageUrl, large = false }: { sku: string; imageUrl: string | null; large?: boolean }) {
  const tone = 'from-secondary to-accent text-primary';
  return <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${tone} ${large ? 'aspect-square rounded-[2rem]' : 'aspect-[4/3] rounded-2xl'}`}>
    {imageUrl ? <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${imageUrl})` }} role="img" aria-label={`Hình sản phẩm ${sku}`} /> : <>
      <div className="absolute -right-12 -top-12 size-48 rounded-full border border-current/10" />
      <div className="absolute -bottom-16 -left-12 size-56 rounded-full border border-current/10" />
      <div className={`relative flex flex-col items-center gap-4 rounded-2xl bg-card/75 text-primary shadow-lg ${large ? 'px-14 py-16' : 'px-9 py-10'}`}>
        <Pill className={large ? 'size-20' : 'size-12'} strokeWidth={1.4} />
        <span className="text-[10px] font-bold tracking-[.25em] uppercase">AN TÂM PHARMACY</span>
      </div>
    </>}
  </div>;
}
