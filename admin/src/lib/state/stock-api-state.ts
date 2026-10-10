import { getStock } from '@/lib/api/stock.api';
import type { Stock } from '@/lib/api/res/stock.res';
import { LocalApiState } from './local-api-state';

export class StockApiState extends LocalApiState<Stock[], string> {
  constructor() {
    super(warehouseId => getStock(warehouseId), warehouseId => `stock:${warehouseId}`);
  }
}

export const stockApiState = new StockApiState();
