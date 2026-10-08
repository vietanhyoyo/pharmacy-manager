'use client';

import { create } from 'zustand';
import { getLookups } from './api/inventory.api';
import type { AdminUser } from './api/res/auth.res';
import type { Lookups } from './api/res/inventory.res';

type AdminState = {
  user: AdminUser | null;
  lookups: Lookups | null;
  revision: number;
  setUser: (user: AdminUser | null) => void;
  loadLookups: () => Promise<void>;
  refresh: () => void;
};

export const useAdminStore = create<AdminState>((set) => ({
  user: null,
  lookups: null,
  revision: 0,
  setUser: user => set({ user }),
  loadLookups: async () => set({ lookups: await getLookups() }),
  refresh: () => set(state => ({ revision: state.revision + 1 })),
}));
