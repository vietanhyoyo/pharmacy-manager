import type { InventoryListSection, Section } from '@/lib/types';
import { dashboardApiState } from './dashboard-api-state';
import { issuesApiState } from './issues-api-state';
import { lookupsApiState } from './lookups-api-state';
import { lotsApiState } from './lots-api-state';
import { movementsApiState } from './movements-api-state';
import { productsApiState } from './products-api-state';
import { receiptsApiState } from './receipts-api-state';
import { stockApiState } from './stock-api-state';
import { suppliersApiState } from './suppliers-api-state';
import { ordersApiState, orderBranchesApiState, orderDetailApiState } from './orders-api-state';

type ApiStateLifecycle = { invalidate: () => void; clear: () => void };

const inventoryApiStatesBySection: Record<InventoryListSection, ApiStateLifecycle> = {
  products: productsApiState,
  lots: lotsApiState,
  stock: stockApiState,
  receipts: receiptsApiState,
  issues: issuesApiState,
  suppliers: suppliersApiState,
  movements: movementsApiState,
};

const affectedListsByMutation: Record<InventoryListSection, InventoryListSection[]> = {
  products: ['products', 'lots', 'stock', 'receipts', 'issues', 'movements'],
  lots: ['lots', 'stock', 'receipts', 'issues', 'movements'],
  stock: ['stock'],
  receipts: ['receipts', 'lots', 'stock', 'movements'],
  issues: ['issues', 'stock', 'movements'],
  suppliers: ['suppliers', 'receipts'],
  movements: ['movements'],
};

/** Invalidate data affected by a successful inventory mutation. */
export function invalidateInventoryApiStates(section: Section): void {
  if (section === 'dashboard' || section === 'orders') return;

  for (const list of affectedListsByMutation[section]) inventoryApiStatesBySection[list].invalidate();
  dashboardApiState.invalidate();
  lookupsApiState.invalidate();
}

/** Clear all inventory cache when the authenticated session ends. */
export function clearInventoryApiStates(): void {
  Object.values(inventoryApiStatesBySection).forEach(state => state.clear());
  dashboardApiState.clear();
  lookupsApiState.clear();
  ordersApiState.clear();
  orderBranchesApiState.clear();
  orderDetailApiState.clear();
}
