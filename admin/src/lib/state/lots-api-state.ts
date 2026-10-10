import { getLots } from '@/lib/api/lots.api';
import type { Lot } from '@/lib/api/res/lots.res';
import { LocalApiState } from './local-api-state';

export class LotsApiState extends LocalApiState<Lot[], string> {
  constructor() {
    super(warehouseId => getLots(warehouseId), warehouseId => `lots:${warehouseId}`);
  }
}

export const lotsApiState = new LotsApiState();
