export type ProductRequest = {
  sku: string;
  name: string;
  categoryId?: string | null;
  activeIngredient?: string | null;
  strength?: string | null;
  dosageForm?: string | null;
  prescriptionType?: 'RX' | 'OTC' | 'OTHER';
  baseUnitId: string;
  status?: 'ACTIVE' | 'INACTIVE';
};

export type ProductListQuery = {
  search?: string;
  categoryId?: string;
  status?: string;
  prescriptionType?: string;
  sortBy?: string;
  sortOrder?: string;
};

export type ProductListFilters = {
  search: string | null;
  categoryId: string | null;
  status: 'ACTIVE' | 'INACTIVE' | null;
  prescriptionType: 'RX' | 'OTC' | 'OTHER' | null;
  sortBy: 'name' | 'sku' | 'createdAt';
  sortOrder: 'asc' | 'desc';
};
