export interface CatalogUnit {
  id: string;
  name: string;
  code: string;
  conversionFactor: number;
  price: number | null;
}

export interface CatalogProduct {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: { id: string; name: string } | null;
  activeIngredient: string | null;
  strength: string | null;
  dosageForm: string | null;
  prescriptionType: string;
  units: CatalogUnit[];
  availableBaseQuantity: number;
}

export interface CatalogPage {
  items: CatalogProduct[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CatalogCategory { id: string; name: string }
