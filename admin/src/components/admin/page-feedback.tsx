import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function PageLoading() {
  return <div className="space-y-4"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map(item => <Skeleton key={item} className="h-36 rounded-xl" />)}</div><Skeleton className="h-80 rounded-xl" /></div>;
}

export function PageError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div role="alert" className="mb-5 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"><span>{message}</span><Button variant="ghost" size="sm" onClick={onRetry}>Thử lại</Button></div>;
}
