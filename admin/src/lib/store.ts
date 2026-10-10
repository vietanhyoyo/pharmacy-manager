'use client';

import { create } from 'zustand';
import type { AdminUser } from './api/res/auth.res';

type AdminState = {
  user: AdminUser | null;
  setUser: (user: AdminUser | null) => void;
};

export const useAdminStore = create<AdminState>((set) => ({
  user: null,
  setUser: user => set({ user }),
}));
