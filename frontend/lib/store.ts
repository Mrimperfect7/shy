import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // Product ID
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  image?: string;
  variantTitle?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const normalizedItem: CartItem = {
          ...item,
          imageUrl: item.imageUrl || item.image || '',
          image: item.image || item.imageUrl || '',
        };
        const existingItem = state.items.find((i) => i.id === normalizedItem.id);
        if (existingItem) {
          return {
            items: state.items.map((i) =>
              i.id === normalizedItem.id ? { ...i, quantity: i.quantity + normalizedItem.quantity } : i
            ),
          };
        }
        return { items: [...state.items, normalizedItem] };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
      })),
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
    }),
    {
      name: 'eshara-cart', // name of the item in the storage (must be unique)
    }
  )
);
