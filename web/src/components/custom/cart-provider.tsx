"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CatalogProduct, CatalogUnit, StoreBranch } from '@/services/types/response/catalog-res';
import { apiClient } from '@/services/api_client';

export interface CartItem {
  productId: string;
  productUnitId: string;
  slug: string;
  name: string;
  unitName: string;
  price: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  ready: boolean;
  branches: StoreBranch[];
  branchId: string;
  selectBranch: (id: string) => void;
  add: (product: CatalogProduct, unit: CatalogUnit, quantity?: number) => void;
  update: (productUnitId: string, quantity: number) => void;
  remove: (productUnitId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = 'antam-storefront-cart-v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [branches, setBranches] = useState<StoreBranch[]>([]);
  const [branchId, setBranchId] = useState('');

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
        const cookieBranch = document.cookie.match(/(?:^|; )storefront_branch=([^;]+)/)?.[1] ?? '';
        setBranchId(cookieBranch);
        const savedItems = Array.isArray(saved) ? [] : saved?.branchId === cookieBranch ? saved?.items : [];
        if (Array.isArray(savedItems)) setItems(savedItems.filter(item =>
          item && typeof item.productId === 'string' && typeof item.productUnitId === 'string' &&
          typeof item.price === 'number' && Number.isInteger(item.quantity) && item.quantity > 0,
        ));
      } catch { localStorage.removeItem(storageKey); }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let active = true;
    void apiClient.get<StoreBranch[]>('/branches').then(({ data }) => {
      if (!active) return;
      setBranches(data);
      const selected = document.cookie.match(/(?:^|; )storefront_branch=([^;]+)/)?.[1] ?? '';
      if (data.length && !data.some(branch => branch.id === selected)) {
        document.cookie = `storefront_branch=${data[0].id}; path=/; max-age=31536000; SameSite=Lax`;
        setBranchId(data[0].id);
        setItems([]);
        router.refresh();
      } else setBranchId(selected);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [router]);

  useEffect(() => { if (ready && branchId) localStorage.setItem(storageKey, JSON.stringify({ branchId, items })); }, [items, ready, branchId]);

  const selectBranch = (id: string) => {
    if (!branches.some(branch => branch.id === id) || id === branchId) return;
    document.cookie = `storefront_branch=${id}; path=/; max-age=31536000; SameSite=Lax`;
    setBranchId(id);
    setItems([]);
    localStorage.setItem(storageKey, JSON.stringify({ branchId: id, items: [] }));
    router.refresh();
  };

  const add = (product: CatalogProduct, unit: CatalogUnit, quantity = 1) => {
    if (!branchId || unit.price === null || unit.price <= 0) return;
    setItems(current => {
      const match = current.find(item => item.productUnitId === unit.id);
      if (match) return current.map(item => item.productUnitId === unit.id ? { ...item, quantity: Math.min(20, item.quantity + quantity), price: unit.price! } : item);
      return [...current, { productId: product.id, productUnitId: unit.id, slug: product.slug, name: product.name, unitName: unit.name, price: unit.price!, quantity }];
    });
  };

  return <CartContext.Provider value={{ items, ready, branches, branchId, selectBranch, add, update: (id, quantity) => setItems(current => current.map(item => item.productUnitId === id ? { ...item, quantity: Math.max(1, Math.min(20, quantity)) } : item)), remove: id => setItems(current => current.filter(item => item.productUnitId !== id)), clear: () => setItems([]) }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
