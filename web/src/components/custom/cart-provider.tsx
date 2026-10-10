"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import type { CatalogProduct, CatalogUnit } from '@/services/types/response/catalog-res';

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
  add: (product: CatalogProduct, unit: CatalogUnit, quantity?: number) => void;
  update: (productUnitId: string, quantity: number) => void;
  remove: (productUnitId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = 'antam-storefront-cart-v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
        if (Array.isArray(saved)) setItems(saved.filter(item =>
          item && typeof item.productId === 'string' && typeof item.productUnitId === 'string' &&
          typeof item.price === 'number' && Number.isInteger(item.quantity) && item.quantity > 0,
        ));
      } catch { localStorage.removeItem(storageKey); }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => { if (ready) localStorage.setItem(storageKey, JSON.stringify(items)); }, [items, ready]);

  const add = (product: CatalogProduct, unit: CatalogUnit, quantity = 1) => {
    if (unit.price === null || unit.price <= 0) return;
    setItems(current => {
      const match = current.find(item => item.productUnitId === unit.id);
      if (match) return current.map(item => item.productUnitId === unit.id ? { ...item, quantity: Math.min(20, item.quantity + quantity), price: unit.price! } : item);
      return [...current, { productId: product.id, productUnitId: unit.id, slug: product.slug, name: product.name, unitName: unit.name, price: unit.price!, quantity }];
    });
  };

  return <CartContext.Provider value={{ items, ready, add, update: (id, quantity) => setItems(current => current.map(item => item.productUnitId === id ? { ...item, quantity: Math.max(1, Math.min(20, quantity)) } : item)), remove: id => setItems(current => current.filter(item => item.productUnitId !== id)), clear: () => setItems([]) }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
