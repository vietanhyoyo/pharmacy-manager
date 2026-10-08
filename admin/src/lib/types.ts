export const sections = ['dashboard', 'products', 'lots', 'stock', 'receipts', 'issues', 'suppliers', 'movements'] as const;
export type Section = typeof sections[number];
