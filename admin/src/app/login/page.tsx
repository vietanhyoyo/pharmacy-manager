'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Pill, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login as loginAdmin } from '@/lib/api/auth.api';
import { useAdminStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAdminStore(state => state.setUser);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setError('');
    try {
      const admin = await loginAdmin({ username, password });
      setUser(admin);
      router.replace('/');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Có lỗi xảy ra'); }
    finally { setPending(false); }
  }

  return <main className="min-h-screen bg-[#f7f7f6] px-5 py-10 flex items-center justify-center">
    <div className="w-full max-w-[440px]">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-zinc-950 text-white"><Pill className="size-6" strokeWidth={1.8} /></div>
        <div className="text-[13px] font-semibold tracking-[0.22em] uppercase text-zinc-500">PharmaFlow</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Quản lý kho thuốc</h1>
        <p className="mt-2 text-sm text-zinc-500">Đăng nhập để tiếp tục vào bảng điều khiển</p>
      </div>
      <Card className="border-zinc-200 bg-white shadow-[0_18px_70px_-38px_rgba(0,0,0,.3)]">
        <CardContent className="px-7 py-8">
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2"><Label htmlFor="username">Tài khoản</Label><Input id="username" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Nhập tài khoản" required /></div>
            <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="password">Mật khẩu</Label><LockKeyhole className="size-3.5 text-zinc-400" /></div><div className="relative"><Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nhập mật khẩu" className="pr-10" required /><Button type="button" variant="ghost" size="icon-sm" className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'} aria-pressed={showPassword} onClick={() => setShowPassword(visible => !visible)}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</Button></div></div>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <Button className="w-full" type="submit" disabled={pending}>{pending ? 'Đang đăng nhập...' : 'Đăng nhập'}<ArrowRight className="ml-2 size-4" /></Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-7 flex items-center justify-center gap-2 text-xs text-zinc-500"><ShieldCheck className="size-4" /> Khu vực dành riêng cho quản trị viên</p>
    </div>
  </main>;
}
