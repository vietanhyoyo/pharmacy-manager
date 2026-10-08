'use client';

import { create } from 'zustand';
import { api } from './api';
import { Lookups, User } from './types';

type AdminState = {
  user: User | null;
  lookups: Lookups | null;
  revision: number;
  setUser: (user: User | null) => void;
  loadLookups: () => Promise<void>;
  refresh: () => void;
};

export const useAdminStore = create<AdminState>((set) => ({
  user: null,
  lookups: null,
  revision: 0,
  setUser: user => set({ user }),
  loadLookups: async () => set({ lookups: await api<Lookups>('admin/lookups') }),
  refresh: () => set(state => ({ revision: state.revision + 1 })),
}));
