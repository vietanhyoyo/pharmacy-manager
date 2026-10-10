import { getLookups } from '@/lib/api/lookups.api';
import type { Lookups } from '@/lib/api/res/lookups.res';
import { LocalApiState } from './local-api-state';

export class LookupsApiState extends LocalApiState<Lookups, void> {
  constructor() {
    super(() => getLookups(), () => 'lookups');
  }
}

export const lookupsApiState = new LookupsApiState();
