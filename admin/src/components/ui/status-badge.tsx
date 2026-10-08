import { cn } from 'cn';
import { Badge } from '@/components/ui/badge';

/**
 * Status configuration map.
 * Each status maps to a label, dot color, text color, and background color.
 * Easily extensible — add new statuses here to use across any page.
 */
const statusConfig: Record<string, { label: string; dot: string; text: string; bg: string; border: string }> = {
  ACTIVE:       { label: 'Đang hoạt động',   dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10',   border: 'border-emerald-200 dark:border-emerald-500/20' },
  INACTIVE:     { label: 'Ngừng hoạt động',   dot: 'bg-gray-400',    text: 'text-gray-600 dark:text-gray-400',       bg: 'bg-gray-100 dark:bg-gray-500/10',       border: 'border-gray-200 dark:border-gray-500/20' },
  POSTED:       { label: 'Đã ghi sổ',         dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10',   border: 'border-emerald-200 dark:border-emerald-500/20' },
  BLOCKED:      { label: 'Đã khóa',           dot: 'bg-red-500',     text: 'text-red-700 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-500/10',           border: 'border-red-200 dark:border-red-500/20' },
  QUARANTINED:  { label: 'Cách ly',            dot: 'bg-amber-500',   text: 'text-amber-700 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-500/10',       border: 'border-amber-200 dark:border-amber-500/20' },
  CLOSED:       { label: 'Đã đóng',           dot: 'bg-gray-400',    text: 'text-gray-600 dark:text-gray-400',       bg: 'bg-gray-100 dark:bg-gray-500/10',       border: 'border-gray-200 dark:border-gray-500/20' },
};

const fallbackConfig = { label: '', dot: 'bg-gray-400', text: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-500/10', border: 'border-gray-200 dark:border-gray-500/20' };

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const config = statusConfig[value] || { ...fallbackConfig, label: value };

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 border px-2.5 py-1 text-[11px] font-medium',
        config.bg,
        config.text,
        config.border,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', config.dot)} />
      {config.label}
    </Badge>
  );
}
