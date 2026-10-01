import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();
const CART_STORAGE_KEY = "rewear-cart";
const API_URL = "http://localhost:5000/api";

const getProductId = (product) => product?.id || product?._id || product?.productId;

const getStoredUser = () => {
  if (typeof window === "undefined") return null;

  try {
    const currentUser = window.localStorage.getItem("rewear-current-user");
    return currentUser ? JSON.parse(currentUser) : null;
  } catch {
    return null;
  }
};

const getCartStorageKey = (user = getStoredUser()) =>
  user?.id ? `${CART_STORAGE_KEY}:${user.id}` : CART_STORAGE_KEY;

const readStoredCart = (key) => {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const mapApiCartToClientItems = (cartItems = []) =>
  cartItems.map((item) => ({
    id: String(item.productId || item._id || item.id),
    productId: String(item.productId || item._id || item.id),
    name: item.name,
    price: Number(item.price || 0),
    image: item.image,
    category: item.category,
    quantity: Number(item.quantity || 1),
  }));

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    return typeof window !== "undefined" ? readStoredCart(getCartStorageKey()) : [];
  });

  useEffect(() => {
    const syncCart = async () => {
      const user = getStoredUser();
      if (!user?.token) {
        setItems(readStoredCart(CART_STORAGE_KEY));
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        let response = await fetch(`${API_URL}/cart`, { headers });
        let result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load cart.");
        }

        const guestItems = readStoredCart(CART_STORAGE_KEY);
        if (guestItems.length > 0) {
          for (const item of guestItems) {
            response = await fetch(`${API_URL}/cart/add`, {
              method: "POST",
              headers: { ...headers, "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: String(item.productId || item.id),
                quantity: Number(item.quantity || 1),
              }),
            });
            result = await response.json();
            if (!response.ok || !result.success) {
              throw new Error(result.message || "Unable to sync guest cart.");
            }
          }

          window.localStorage.removeItem(CART_STORAGE_KEY);
          response = await fetch(`${API_URL}/cart`, { headers });
          result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to reload cart.");
          }
        }

        setItems(mapApiCartToClientItems(result.cart || []));
      } catch (error) {
        console.error("Failed to sync cart from server", error);
      }
    };

    syncCart();
    window.addEventListener("rewear-auth-changed", syncCart);
    return () => window.removeEventListener("rewear-auth-changed", syncCart);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(getCartStorageKey(), JSON.stringify(items));
    }
  }, [items]);

  const addToCart = async (product) => {
    const normalizedProductId = String(getProductId(product));
    const user = getStoredUser();

    if (user?.token) {
      try {
        const response = await fetch(`${API_URL}/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ productId: normalizedProductId, quantity: 1 }),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to add item to cart.");
        }

        setItems(mapApiCartToClientItems(result.cart || []));
        return;
      } catch (error) {
        console.error("Cart sync failed", error);
        return;
      }
    }

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => String(item.id) === normalizedProductId);

      if (existingItem) {
        return currentItems.map((item) =>
          String(item.id) === normalizedProductId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          id: normalizedProductId,
          productId: normalizedProductId,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = async (id, change) => {
    const normalizedId = String(id);
    const user = getStoredUser();

    if (user?.token) {
      const currentItem = items.find((item) => String(item.id) === normalizedId);
      const nextQuantity = Math.max(0, (currentItem?.quantity || 1) + change);

      if (nextQuantity === 0) {
        await removeFromCart(normalizedId);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/cart/update/${normalizedId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ quantity: nextQuantity }),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to update cart.");
        }

        const cartItems = result.cart || [];
        setItems(mapApiCartToClientItems(cartItems));
        return;
      } catch (error) {
        console.error("Cart update failed", error);
        return;
      }
    }

    setItems((currentItems) =>
      currentItems
        .map((item) =>
          String(item.id) === normalizedId
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = async (id) => {
    const normalizedId = String(id);
    const user = getStoredUser();

    if (user?.token) {
      try {
        const response = await fetch(`${API_URL}/cart/remove/${normalizedId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to remove item from cart.");
        }

        const cartItems = result.cart || [];
        setItems(mapApiCartToClientItems(cartItems));
        return;
      } catch (error) {
        console.error("Cart removal failed", error);
        return;
      }
    }

    setItems((currentItems) => currentItems.filter((item) => String(item.id) !== normalizedId));
  };

  const clearCart = async () => {
    const user = getStoredUser();

    if (user?.token) {
      try {
        const response = await fetch(`${API_URL}/cart/clear`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to clear cart.");
        }
      } catch (error) {
        console.error("Clear cart failed", error);
        return false;
      }
    }

    setItems([]);
    return true;
  };

  const placeOrder = async (customerDetails) => {
    const user = getStoredUser();
    const cartPayload = items.map((item) => ({
      productId: String(item.productId || item.id),
      quantity: Number(item.quantity || 1),
    }));

    if (!user?.token) {
      throw new Error("Please log in before placing an order.");
    }

    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        items: cartPayload,
        shippingAddress: {
          fullName: customerDetails.fullName,
          phone: customerDetails.phone,
          address: `${customerDetails.addressLine1 || ""} ${customerDetails.addressLine2 || ""}`.trim(),
          city: customerDetails.city,
          state: customerDetails.state,
          zipCode: customerDetails.pinCode,
          country: "India",
        },
        paymentMethod: customerDetails.paymentMethod || "UPI",
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.success || !result.order?._id) {
      throw new Error(result.message || "Unable to place order.");
    }

    await clearCart();
    setItems([]);
    return {
      id: result.order._id,
      createdAt: result.order.createdAt,
      status: result.order.status,
      items: result.order.items,
      subtotal: result.order.subtotal,
      shipping: result.order.shipping,
      total: result.order.total,
      customer: result.order.customer,
    };
  };

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
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
