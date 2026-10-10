export const sections = ['dashboard', 'orders', 'products', 'lots', 'stock', 'receipts', 'issues', 'suppliers', 'movements'] as const;
export type Section = typeof sections[number];
export type InventoryListSection = Exclude<Section, 'dashboard' | 'orders'>;
