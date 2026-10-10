import { getReceipts } from '@/lib/api/receipts.api';
import type { Receipt } from '@/lib/api/res/receipts.res';
import { LocalApiState } from './local-api-state';

export class ReceiptsApiState extends LocalApiState<Receipt[], void> {
  constructor() {
    super(() => getReceipts(), () => 'all');
  }
}

export const receiptsApiState = new ReceiptsApiState();
