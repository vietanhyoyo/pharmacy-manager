import { getMovements } from '@/lib/api/movements.api';
import type { Movement } from '@/lib/api/res/movements.res';
import { LocalApiState } from './local-api-state';

export class MovementsApiState extends LocalApiState<Movement[], void> {
  constructor() {
    super(() => getMovements(), () => 'all');
  }
}

export const movementsApiState = new MovementsApiState();
