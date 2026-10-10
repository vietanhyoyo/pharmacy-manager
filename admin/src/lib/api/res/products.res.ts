export type Product = {
  id: string;
  sku: string;
  name: string;
  activeIngredient: string | null;
  strength: string | null;
  dosageForm: string | null;
  prescriptionType: string;
  categoryId: string | null;
  categoryName: string | null;
  baseUnitId: string;
  unitName: string;
  status: string;
  quantity: string;
};
