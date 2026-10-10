import { getStock } from '@/lib/api/stock.api';
import type { Stock } from '@/lib/api/res/stock.res';
import { LocalApiState } from './local-api-state';

export class StockApiState extends LocalApiState<Stock[], void> {
  constructor() {
    super(() => getStock(), () => 'all');
  }
}

export const stockApiState = new StockApiState();
