import { getSuppliers } from '@/lib/api/suppliers.api';
import type { Supplier } from '@/lib/api/res/suppliers.res';
import { LocalApiState } from './local-api-state';

export class SuppliersApiState extends LocalApiState<Supplier[], void> {
  constructor() {
    super(() => getSuppliers(), () => 'all');
  }
}

export const suppliersApiState = new SuppliersApiState();
