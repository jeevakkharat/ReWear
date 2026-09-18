import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();
const CART_STORAGE_KEY = "rewear-cart";
const ORDERS_STORAGE_KEY = "rewear-orders";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = typeof window !== "undefined" ? window.localStorage.getItem(CART_STORAGE_KEY) : null;
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addToCart = (product) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, change) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  const placeOrder = (customerDetails) => {
    const order = {
      id: `RW-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "Pending",
      items,
      subtotal,
      shipping,
      total,
      customer: customerDetails,
    };

    if (typeof window !== "undefined") {
      const previousOrders = JSON.parse(window.localStorage.getItem(ORDERS_STORAGE_KEY) || "[]");
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([order, ...previousOrders]));
    }

    clearCart();
    return order;
  };

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const shipping = subtotal >= 3000 ? 0 : subtotal > 0 ? 120 : 0;
  const total = subtotal + shipping;

  const value = {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    itemCount,
    subtotal,
    shipping,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
