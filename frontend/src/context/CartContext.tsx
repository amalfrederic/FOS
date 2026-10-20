import React, { createContext, useContext, useState, useEffect } from 'react';
import { Food, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (food: Food, quantity?: number) => void;
  removeFromCart: (foodId: number) => void;
  updateQuantity: (foodId: number, quantity: number) => void;
  clearCart: () => void;
  totalItemCount: number;
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'foodiehub_cart';
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE_FLAT = 40;
const TAX_RATE = 0.05;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (food: Food, quantity = 1) => {
    if (!food.is_available) return;

    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.food.id === food.id);
      if (existing) {
        const newQty = Math.min(50, existing.quantity + quantity);
        return prevItems.map((item) =>
          item.food.id === food.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prevItems, { food, quantity: Math.min(50, Math.max(1, quantity)) }];
    });
  };

  const removeFromCart = (foodId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.food.id !== foodId));
  };

  const updateQuantity = (foodId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    const clampedQty = Math.min(50, quantity);
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.food.id === foodId ? { ...item, quantity: clampedQty } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = Number(
    items.reduce((sum, item) => sum + item.food.price * item.quantity, 0).toFixed(2)
  );

  const deliveryFee = subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE_FLAT : 0;

  const taxAmount = Number((subtotal * TAX_RATE).toFixed(2));

  const totalAmount = subtotal > 0 ? Number((subtotal + deliveryFee + taxAmount).toFixed(2)) : 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemCount,
        subtotal,
        deliveryFee,
        taxAmount,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
