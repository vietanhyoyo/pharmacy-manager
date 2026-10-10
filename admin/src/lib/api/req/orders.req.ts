export type OrderListQuery = { branchId?: string; status?: string; search?: string; page?: number };
export type OrderAction = 'confirm' | 'dispatch' | 'complete' | 'cancel';
