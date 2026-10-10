export type SupplierRequest = {
  code: string;
  name: string;
  phone?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
};
