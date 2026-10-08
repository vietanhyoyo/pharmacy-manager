'use client';

import { FormEvent, ReactNode, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { useAdminStore } from '@/lib/store';
import { Lot, Product, Section, Supplier } from '@/lib/types';

type Editor = { section: Section; item?: Product | Lot | Supplier } | null;
type Line = { productId: string; lotId: string; quantity: string; purchasePrice: string };
type Option = { value: string; label: string };
const blankLine = (): Line => ({ productId: '', lotId: '', quantity: '', purchasePrice: '' });

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

function FormSelect({ label, value, onChange, options, placeholder, disabled, required, allowNone }: {
  label: string; value: string; onChange: (value: string) => void; options: Option[];
  placeholder: string; disabled?: boolean; required?: boolean; allowNone?: boolean;
}) {
  return <Select items={allowNone ? [{ value: '__none__', label: 'Không chọn' }, ...options] : options} value={value || null} onValueChange={next => onChange(next === '__none__' ? '' : next ?? '')} disabled={disabled} required={required}>
    <SelectTrigger aria-label={label} className="w-full text-base md:text-sm"><SelectValue placeholder={placeholder} /></SelectTrigger>
    <SelectContent alignItemWithTrigger={false}>
      {allowNone && <SelectItem value="__none__">Không chọn</SelectItem>}
      {options.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
    </SelectContent>
  </Select>;
}

const activeOptions: Option[] = [
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'INACTIVE', label: 'Ngừng hoạt động' },
];

export function EditorDialog({ editor, onClose, onSaved }: { editor: Editor; onClose: () => void; onSaved: () => void }) {
  const lookups = useAdminStore(state => state.lookups);
  const item = editor?.item;
  const product = editor?.section === 'products' ? item as Product | undefined : undefined;
  const supplier = editor?.section === 'suppliers' ? item as Supplier | undefined : undefined;
  const lot = editor?.section === 'lots' ? item as Lot | undefined : undefined;
  const [form, setForm] = useState<Record<string, string>>(() => ({
    sku: product?.sku || '', name: product?.name || supplier?.name || '', activeIngredient: product?.activeIngredient || '',
    strength: product?.strength || '', dosageForm: product?.dosageForm || '', prescriptionType: product?.prescriptionType || 'OTC',
    categoryId: product?.categoryId || '', baseUnitId: product?.baseUnitId || '', status: product?.status || supplier?.status || lot?.status || 'ACTIVE',
    code: supplier?.code || '', phone: supplier?.phone || '', productId: lot?.productId || '', batchNumber: lot?.batchNumber || '',
    manufacturingDate: lot?.manufacturingDate?.slice(0, 10) || '', expiryDate: lot?.expiryDate?.slice(0, 10) || '', supplierId: '',
    reasonCode: 'INTERNAL_USE', note: '',
  }));
  const [lines, setLines] = useState<Line[]>([blankLine()]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const set = (key: string, value: string) => setForm(previous => ({ ...previous, [key]: value }));
  const lineSet = (index: number, key: keyof Line, value: string) => setLines(previous => previous.map((line, i) => i === index ? { ...line, [key]: value, ...(key === 'productId' ? { lotId: '' } : {}) } : line));
  const titles: Partial<Record<Section, string>> = { products: item ? 'Chỉnh sửa thuốc' : 'Thêm thuốc mới', suppliers: item ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp', lots: item ? 'Chỉnh sửa lô hàng' : 'Thêm lô hàng', receipts: 'Tạo phiếu nhập kho', issues: 'Tạo phiếu xuất kho' };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    if ((editor.section === 'products' && !form.baseUnitId) || (editor.section === 'lots' && !form.productId)
      || (editor.section === 'receipts' && !form.supplierId)
      || (['receipts', 'issues'].includes(editor.section) && lines.some(line => !line.productId || !line.lotId))) {
      setError('Vui lòng chọn đầy đủ các trường bắt buộc');
      return;
    }
    setPending(true); setError('');
    try {
      let body: object;
      if (editor.section === 'products') body = { sku: form.sku, name: form.name, activeIngredient: form.activeIngredient, strength: form.strength, dosageForm: form.dosageForm, prescriptionType: form.prescriptionType, categoryId: form.categoryId || null, baseUnitId: form.baseUnitId, status: form.status };
      else if (editor.section === 'suppliers') body = { code: form.code, name: form.name, phone: form.phone, status: form.status };
      else if (editor.section === 'lots') body = { productId: form.productId, batchNumber: form.batchNumber, manufacturingDate: form.manufacturingDate || null, expiryDate: form.expiryDate, status: form.status };
      else if (editor.section === 'receipts') body = { supplierId: form.supplierId, lines: lines.map(line => ({ productId: line.productId, lotId: line.lotId, quantity: Number(line.quantity), purchasePrice: Number(line.purchasePrice) })) };
      else if (editor.section === 'issues') body = { reasonCode: form.reasonCode, note: form.note, lines: lines.map(line => ({ productId: line.productId, lotId: line.lotId, quantity: Number(line.quantity) })) };
      else return;
      const path = `admin/${editor.section}${item ? `/${item.id}` : ''}`;
      await api(path, { method: item ? 'PUT' : 'POST', body: JSON.stringify(body) });
      onSaved();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Có lỗi xảy ra'); }
    finally { setPending(false); }
  }

  const productOptions = lookups?.products.map(row => ({ value: row.id, label: `${row.name} (${row.sku})` })) || [];
  const statusOptions = editor?.section === 'lots'
    ? [{ value: 'ACTIVE', label: 'Đang hoạt động' }, { value: 'BLOCKED', label: 'Đã khóa' }, { value: 'QUARANTINED', label: 'Cách ly' }, { value: 'CLOSED', label: 'Đã đóng' }]
    : activeOptions;

  return <Dialog open={!!editor} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="inset-0 top-0 left-0 m-auto h-fit max-h-[90vh] translate-x-0 translate-y-0 overflow-y-auto sm:max-w-[620px]">
      <DialogHeader><DialogTitle>{editor ? titles[editor.section] : ''}</DialogTitle><DialogDescription>{item ? 'Cập nhật thông tin và lưu thay đổi.' : 'Điền thông tin để ghi nhận vào hệ thống kho.'}</DialogDescription></DialogHeader>
      {editor && <form onSubmit={submit} className="space-y-5 pt-2">
        {editor.section === 'products' && <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mã thuốc *"><Input value={form.sku} onChange={e => set('sku', e.target.value)} maxLength={64} required placeholder="VD: PARA-500" /></Field>
          <Field label="Tên thuốc *"><Input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Tên sản phẩm" /></Field>
          <Field label="Nhóm thuốc"><FormSelect label="Nhóm thuốc" value={form.categoryId} onChange={value => set('categoryId', value)} options={lookups?.categories.map(row => ({ value: row.id, label: row.name })) || []} placeholder="Chọn nhóm" allowNone /></Field>
          <Field label="Đơn vị gốc *"><FormSelect label="Đơn vị gốc" value={form.baseUnitId} onChange={value => set('baseUnitId', value)} options={lookups?.units.map(row => ({ value: row.id, label: row.name })) || []} placeholder="Chọn đơn vị" disabled={!!item} required /></Field>
          <Field label="Hoạt chất"><Input value={form.activeIngredient} onChange={e => set('activeIngredient', e.target.value)} placeholder="VD: Paracetamol" /></Field>
          <Field label="Hàm lượng"><Input value={form.strength} onChange={e => set('strength', e.target.value)} placeholder="VD: 500mg" /></Field>
          <Field label="Dạng bào chế"><Input value={form.dosageForm} onChange={e => set('dosageForm', e.target.value)} placeholder="VD: Viên nén" /></Field>
          <Field label="Loại thuốc"><FormSelect label="Loại thuốc" value={form.prescriptionType} onChange={value => set('prescriptionType', value)} options={[{ value: 'OTC', label: 'Không kê đơn' }, { value: 'RX', label: 'Kê đơn' }, { value: 'OTHER', label: 'Khác' }]} placeholder="Chọn loại thuốc" /></Field>
          {item && <Field label="Trạng thái"><FormSelect label="Trạng thái" value={form.status} onChange={value => set('status', value)} options={statusOptions} placeholder="Chọn trạng thái" /></Field>}
        </div>}

        {editor.section === 'suppliers' && <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mã nhà cung cấp *"><Input value={form.code} onChange={e => set('code', e.target.value)} required placeholder="VD: NCC-001" /></Field>
          <Field label="Tên nhà cung cấp *"><Input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Tên doanh nghiệp" /></Field>
          <Field label="Số điện thoại"><Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Số liên hệ" /></Field>
          {item && <Field label="Trạng thái"><FormSelect label="Trạng thái" value={form.status} onChange={value => set('status', value)} options={statusOptions} placeholder="Chọn trạng thái" /></Field>}
        </div>}

        {editor.section === 'lots' && <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Thuốc *"><FormSelect label="Thuốc" value={form.productId} onChange={value => set('productId', value)} options={productOptions} placeholder="Chọn thuốc" disabled={!!item} required /></Field>
          <Field label="Số lô *"><Input value={form.batchNumber} onChange={e => set('batchNumber', e.target.value)} required placeholder="VD: LO-2026-001" /></Field>
          <Field label="Ngày sản xuất"><Input type="date" value={form.manufacturingDate} onChange={e => set('manufacturingDate', e.target.value)} /></Field>
          <Field label="Hạn dùng *"><Input type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} required /></Field>
          {item && <Field label="Trạng thái"><FormSelect label="Trạng thái" value={form.status} onChange={value => set('status', value)} options={statusOptions} placeholder="Chọn trạng thái" /></Field>}
        </div>}

        {(editor.section === 'receipts' || editor.section === 'issues') && <div className="space-y-5">
          {editor.section === 'receipts'
            ? <Field label="Nhà cung cấp *"><FormSelect label="Nhà cung cấp" value={form.supplierId} onChange={value => set('supplierId', value)} options={lookups?.suppliers.map(row => ({ value: row.id, label: row.name })) || []} placeholder="Chọn nhà cung cấp" required /></Field>
            : <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Lý do xuất *"><FormSelect label="Lý do xuất" value={form.reasonCode} onChange={value => set('reasonCode', value)} options={[{ value: 'INTERNAL_USE', label: 'Sử dụng nội bộ' }, { value: 'DAMAGED', label: 'Hư hỏng' }, { value: 'EXPIRED', label: 'Hết hạn' }, { value: 'SAMPLE', label: 'Hàng mẫu' }, { value: 'OTHER', label: 'Khác' }]} placeholder="Chọn lý do" required /></Field>
                <Field label="Ghi chú"><Textarea className="min-h-9" value={form.note} onChange={e => set('note', e.target.value)} placeholder="Nội dung bổ sung" /></Field>
              </div>}
          <div className="space-y-3">
            <div className="flex items-center justify-between"><Label>Danh sách thuốc</Label><Button type="button" variant="outline" size="sm" onClick={() => setLines(previous => [...previous, blankLine()])}><Plus className="mr-1 size-3.5" /> Thêm dòng</Button></div>
            {lines.map((line, index) => <div key={index} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-zinc-500">Dòng {index + 1}</span>{lines.length > 1 && <Button type="button" size="icon-sm" variant="ghost" aria-label="Xóa dòng" onClick={() => setLines(previous => previous.filter((_, i) => i !== index))}><Trash2 className="size-4" /></Button>}</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Thuốc *"><FormSelect label={`Thuốc dòng ${index + 1}`} value={line.productId} onChange={value => lineSet(index, 'productId', value)} options={productOptions} placeholder="Chọn thuốc" required /></Field>
                <Field label="Lô hàng *"><FormSelect label={`Lô hàng dòng ${index + 1}`} value={line.lotId} onChange={value => lineSet(index, 'lotId', value)} options={lookups?.lots.filter(row => row.productId === line.productId).map(row => ({ value: row.id, label: `${row.batchNumber} · HSD ${row.expiryDate?.slice(0, 10)}` })) || []} placeholder="Chọn lô" required /></Field>
                <Field label="Số lượng *"><Input type="number" min="0.000001" step="0.000001" value={line.quantity} onChange={e => lineSet(index, 'quantity', e.target.value)} required placeholder="0" /></Field>
                {editor.section === 'receipts' && <Field label="Giá nhập / đơn vị (₫) *"><Input type="number" min="0" step="0.0001" value={line.purchasePrice} onChange={e => lineSet(index, 'purchasePrice', e.target.value)} required placeholder="0" /></Field>}
              </div>
            </div>)}
          </div>
        </div>}
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Hủy</Button><Button type="submit" disabled={pending}>{pending ? 'Đang lưu...' : item ? 'Lưu thay đổi' : 'Lưu vào hệ thống'}</Button></DialogFooter>
      </form>}
    </DialogContent>
  </Dialog>;
}

export function PasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (value: boolean) => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError('');
    try { await api('auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }); setCurrentPassword(''); setNewPassword(''); onOpenChange(false); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Có lỗi xảy ra'); }
    finally { setPending(false); }
  }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Đổi mật khẩu</DialogTitle><DialogDescription>Mật khẩu mới cần có ít nhất 12 ký tự.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><Field label="Mật khẩu hiện tại"><Input type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required /></Field><Field label="Mật khẩu mới"><Input type="password" autoComplete="new-password" minLength={12} value={newPassword} onChange={e => setNewPassword(e.target.value)} required /></Field>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button><Button type="submit" disabled={pending}>{pending ? 'Đang lưu...' : 'Đổi mật khẩu'}</Button></DialogFooter></form></DialogContent></Dialog>;
}
