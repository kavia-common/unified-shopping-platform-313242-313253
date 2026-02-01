import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

// PUBLIC_INTERFACE
export function CartProvider({ api, isAuthenticated, children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // PUBLIC_INTERFACE
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const next = await api.getCart();
      setCart(next);
    } finally {
      setLoading(false);
    }
  }, [api, isAuthenticated]);

  // PUBLIC_INTERFACE
  const addOrUpdateItem = useCallback(
    async (productId, quantity) => {
      const next = await api.upsertCartItem({ product_id: productId, quantity });
      setCart(next);
      return next;
    },
    [api]
  );

  // PUBLIC_INTERFACE
  const removeItem = useCallback(
    async (cartItemId) => {
      const next = await api.removeCartItem(cartItemId);
      setCart(next);
      return next;
    },
    [api]
  );

  // PUBLIC_INTERFACE
  const clear = useCallback(async () => {
    const next = await api.clearCart();
    setCart(next);
    return next;
  }, [api]);

  const itemsCount = useMemo(() => {
    if (!cart || !Array.isArray(cart.items)) return 0;
    return cart.items.reduce((sum, it) => sum + (it.quantity || 0), 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    if (!cart) return "0.00";
    return cart.subtotal || "0.00";
  }, [cart]);

  const value = useMemo(
    () => ({
      cart,
      loading,
      itemsCount,
      subtotal,
      refreshCart,
      addOrUpdateItem,
      removeItem,
      clear,
      setCart, // internal escape hatch
    }),
    [addOrUpdateItem, cart, clear, itemsCount, loading, refreshCart, removeItem, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// PUBLIC_INTERFACE
export function useCart() {
  /** Access cart state and actions. */
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
