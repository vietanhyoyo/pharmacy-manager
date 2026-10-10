'use client';

import { create } from 'zustand';
import type { AdminUser } from './api/res/auth.res';

type AdminState = {
  user: AdminUser | null;
  selectedWarehouseId: string | null;
  setUser: (user: AdminUser | null) => void;
  setSelectedWarehouseId: (id: string | null) => void;
};

export const useAdminStore = create<AdminState>((set) => ({
  user: null,
  selectedWarehouseId: null,
  setUser: user => set({ user }),
  setSelectedWarehouseId: id => set({ selectedWarehouseId: id }),
}));
