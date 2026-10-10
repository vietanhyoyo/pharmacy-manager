import { getMovements } from '@/lib/api/movements.api';
import type { Movement } from '@/lib/api/res/movements.res';
import { LocalApiState } from './local-api-state';

export class MovementsApiState extends LocalApiState<Movement[], string> {
  constructor() {
    super(warehouseId => getMovements(warehouseId), warehouseId => `movements:${warehouseId}`);
  }
}

export const movementsApiState = new MovementsApiState();
