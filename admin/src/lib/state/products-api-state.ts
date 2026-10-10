import { getProducts } from '@/lib/api/products.api';
import type { ProductListQuery } from '@/lib/api/req/products.req';
import type { Product } from '@/lib/api/res/products.res';
import { LocalApiState } from './local-api-state';

export class ProductsApiState extends LocalApiState<Product[], ProductListQuery | undefined> {
  constructor() {
    super(query => getProducts(query), query => JSON.stringify(query ?? {}));
  }
}

export const productsApiState = new ProductsApiState();
