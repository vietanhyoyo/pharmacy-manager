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
