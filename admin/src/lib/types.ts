export const sections = ['dashboard', 'products', 'lots', 'stock', 'receipts', 'issues', 'suppliers', 'movements'] as const;
export type Section = typeof sections[number];
export type InventoryListSection = Exclude<Section, 'dashboard'>;
