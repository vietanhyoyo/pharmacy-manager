import { getLots } from '@/lib/api/lots.api';
import type { Lot } from '@/lib/api/res/lots.res';
import { LocalApiState } from './local-api-state';

export class LotsApiState extends LocalApiState<Lot[], void> {
  constructor() {
    super(() => getLots(), () => 'all');
  }
}

export const lotsApiState = new LotsApiState();
