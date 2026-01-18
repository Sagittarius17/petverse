
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type Product } from './shop-data';
import { toast } from '@/hooks/use-toast';

export interface CartItem extends Product {
  quantity: number;
}

export interface WishlistItem extends Product {}

interface CartState {
  items: CartItem[];
  wishlist: WishlistItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;

  // Actions to be called by other parts of the app
  _hydrate: () => void;
  _updateTotals: () => void;
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      totalItems: 0,
      subtotal: 0,

      addToCart: (product) => {
        const existingItem = get().items.find((item) => item.id === product.id);
        if (existingItem) {
          get().incrementQuantity(product.id);
        } else {
          set((state) => ({
            items: [...state.items, { ...product, quantity: 1 }],
          }));
        }
        get()._updateTotals();
        toast({
          title: 'Added to Cart',
          description: `${product.name} has been added to your cart.`,
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
        get()._updateTotals();
      },

      incrementQuantity: (productId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }));
        get()._updateTotals();
      },

      decrementQuantity: (productId) => {
        const item = get().items.find((item) => item.id === productId);
        if (item && item.quantity > 1) {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            ),
          }));
        } else {
          get().removeFromCart(productId);
        }
        get()._updateTotals();
      },
      
      clearCart: () => {
        set({ items: [] });
        get()._updateTotals();
      },

      toggleWishlist: (product) => {
        const isWishlisted = get().isWishlisted(product.id);
        if (isWishlisted) {
          set((state) => ({
            wishlist: state.wishlist.filter((item) => item.id !== product.id),
          }));
           toast({
            title: 'Removed from Wishlist',
            description: `${product.name} has been removed from your wishlist.`,
          });
        } else {
          set((state) => ({
            wishlist: [...state.wishlist, product],
          }));
          toast({
            title: 'Added to Wishlist',
            description: `${product.name} has been added to your wishlist.`,
          });
        }
      },

      isWishlisted: (productId) => {
        return get().wishlist.some((item) => item.id === productId);
      },

      _updateTotals: () => {
        const items = get().items;
        const totalItems = items.reduce((total, item) => total + item.quantity, 0);
        const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
        set({ totalItems, subtotal });
      },

      _hydrate: () => {
        get()._updateTotals();
      },
    }),
    {
      name: 'petshop-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hydrate();
        }
      },
    }
  )
);

// Call _hydrate on initial load
useCartStore.getState()._hydrate();

export default useCartStore;
