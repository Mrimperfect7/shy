"use client";

import React, { createContext, useContext, useState } from "react";
import { useCartStore } from "@/lib/store";
import { trackAddToCart } from "@/lib/tracking";

interface CartContextType {
  cart: any; // Simplified for custom backend
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: any, quantity?: number, customPrice?: number) => Promise<void>;
  updateItem: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const cartStore = useCartStore();

  const cart = {
    lines: cartStore.items,
    totalQuantity: cartStore.items.reduce((acc, item) => acc + item.quantity, 0),
    cost: {
      totalAmount: { amount: cartStore.getCartTotal().toString(), currencyCode: "INR" }
    }
  };

  const addItem = async (product: any, quantity = 1, customPrice?: number) => {
    const price = customPrice !== undefined ? customPrice : parseFloat(product.price);
    cartStore.addItem({
      id: product.id,
      title: product.title,
      price: price,
      quantity,
      imageUrl: product.featuredImage?.url || product.images?.[0]?.url || ""
    });
    
    // Track Meta Pixel AddToCart
    trackAddToCart(product.id, price * quantity, quantity, "INR");
    
    setIsOpen(true);
  };

  const updateItem = async (id: string, quantity: number) => {
    cartStore.updateQuantity(id, quantity);
  };

  const removeItem = async (id: string) => {
    cartStore.removeItem(id);
  };

  return (
    <CartContext.Provider value={{
      cart, isOpen, isLoading: false,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem, updateItem, removeItem
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
