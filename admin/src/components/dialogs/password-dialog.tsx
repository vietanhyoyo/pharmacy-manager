'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { changePassword } from '@/lib/api/auth.api';

function PasswordField({ label, ...inputProps }: { label: string } & import('react').ComponentProps<typeof Input>) {
  return <div className="space-y-2"><Label>{label}</Label><Input {...inputProps} /></div>;
}

export function PasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (value: boolean) => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      onOpenChange(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Có lỗi xảy ra');
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Đổi mật khẩu</DialogTitle><DialogDescription>Mật khẩu mới cần có ít nhất 12 ký tự.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <PasswordField label="Mật khẩu hiện tại" type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required />
          <PasswordField label="Mật khẩu mới" type="password" autoComplete="new-password" minLength={12} value={newPassword} onChange={event => setNewPassword(event.target.value)} required />
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button><Button type="submit" disabled={pending}>{pending ? 'Đang lưu...' : 'Đổi mật khẩu'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
