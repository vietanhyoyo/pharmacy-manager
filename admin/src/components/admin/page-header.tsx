import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pageMetadata } from '@/lib/navigation';
import type { Section } from '@/lib/types';

export function PageHeader({ section, onAction }: { section: Section; onAction?: () => void }) {
  const page = pageMetadata[section];

  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Tổng quan / {section === 'dashboard' ? 'Kho thuốc' : page.title}</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-[34px]">{page.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{page.subtitle}</p>
      </div>
      {page.action && onAction && <Button size="lg" onClick={onAction}><Plus />{page.action}</Button>}
    </div>
  );
}
