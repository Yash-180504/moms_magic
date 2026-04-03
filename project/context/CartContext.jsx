"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

const CartContext = createContext(null);

const CART_KEY = "mm_cart_v1";

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeCart(raw) {
  const empty = { provider: null, items: {}, deliveryAddress: "", notes: "" };
  if (!raw || typeof raw !== "object") return empty;

  const provider =
    raw.provider && typeof raw.provider === "object"
      ? {
          id: raw.provider.id || null,
          kitchen_name: raw.provider.kitchen_name || "",
          location: raw.provider.location || "",
          cover_image_url: raw.provider.cover_image_url || null,
        }
      : null;

  const items = raw.items && typeof raw.items === "object" ? raw.items : {};
  const normalizedItems = {};
  for (const [menuItemId, entry] of Object.entries(items)) {
    if (!entry || typeof entry !== "object") continue;
    const qty = parseInt(entry.qty) || 0;
    const item =
      entry.item && typeof entry.item === "object" ? entry.item : null;
    if (!item || !item.id || qty <= 0) continue;
    normalizedItems[menuItemId] = { item, qty };
  }

  return {
    provider: provider?.id ? provider : null,
    items: normalizedItems,
    deliveryAddress:
      typeof raw.deliveryAddress === "string" ? raw.deliveryAddress : "",
    notes: typeof raw.notes === "string" ? raw.notes : "",
  };
}

function readCartFromStorage() {
  if (typeof window === "undefined")
    return { provider: null, items: {}, deliveryAddress: "", notes: "" };
  return normalizeCart(
    safeJsonParse(localStorage.getItem(CART_KEY) || "null", null),
  );
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => readCartFromStorage());

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const itemCount = useMemo(() => {
    return Object.values(cart.items).reduce((sum, e) => sum + (e.qty || 0), 0);
  }, [cart.items]);

  const total = useMemo(() => {
    return Object.values(cart.items).reduce(
      (sum, e) => sum + (Number(e.item?.price) || 0) * (e.qty || 0),
      0,
    );
  }, [cart.items]);

  const clearCart = useCallback(() => {
    setCart({ provider: null, items: {}, deliveryAddress: "", notes: "" });
  }, []);

  const setDeliveryAddress = useCallback((deliveryAddress) => {
    setCart((prev) => ({ ...prev, deliveryAddress }));
  }, []);

  const setNotes = useCallback((notes) => {
    setCart((prev) => ({ ...prev, notes }));
  }, []);

  const getQty = useCallback(
    (menuItemId) => {
      return cart.items?.[menuItemId]?.qty || 0;
    },
    [cart.items],
  );

  const addItem = useCallback((provider, item) => {
    if (!provider?.id || !item?.id) return;

    setCart((prev) => {
      // Provider checks
      if (
        prev.provider?.id &&
        prev.provider.id !== provider.id &&
        Object.keys(prev.items || {}).length > 0
      ) {
        const ok = window.confirm(
          "Your cart has items from another kitchen. Clear cart and start a new one?",
        );
        if (!ok) return prev;
        prev = {
          provider: null,
          items: {},
          deliveryAddress: prev.deliveryAddress,
          notes: prev.notes,
        };
      }

      const nextProvider = prev.provider?.id
        ? prev.provider
        : {
            id: provider.id,
            kitchen_name: provider.kitchen_name || "",
            location: provider.location || "",
            cover_image_url: provider.cover_image_url || null,
          };

      const current = prev.items?.[item.id];
      const nextQty = (current?.qty || 0) + 1;

      return {
        ...prev,
        provider: nextProvider,
        items: {
          ...prev.items,
          [item.id]: {
            item: {
              id: item.id,
              name: item.name,
              price: item.price,
              image_url: item.image_url || null,
              is_veg: !!item.is_veg,
            },
            qty: nextQty,
          },
        },
      };
    });
  }, []);

  const removeOne = useCallback((menuItemId) => {
    if (!menuItemId) return;
    setCart((prev) => {
      const current = prev.items?.[menuItemId];
      if (!current) return prev;
      const nextQty = (current.qty || 0) - 1;
      const nextItems = { ...(prev.items || {}) };
      if (nextQty > 0) nextItems[menuItemId] = { ...current, qty: nextQty };
      else delete nextItems[menuItemId];

      const provider = Object.keys(nextItems).length ? prev.provider : null;
      return { ...prev, items: nextItems, provider };
    });
  }, []);

  const removeItem = useCallback((menuItemId) => {
    if (!menuItemId) return;
    setCart((prev) => {
      if (!prev.items?.[menuItemId]) return prev;
      const nextItems = { ...(prev.items || {}) };
      delete nextItems[menuItemId];
      const provider = Object.keys(nextItems).length ? prev.provider : null;
      return { ...prev, items: nextItems, provider };
    });
  }, []);

  const value = useMemo(() => {
    return {
      cart,
      itemCount,
      total,
      getQty,
      addItem,
      removeOne,
      removeItem,
      clearCart,
      setDeliveryAddress,
      setNotes,
    };
  }, [
    cart,
    itemCount,
    total,
    getQty,
    addItem,
    removeOne,
    removeItem,
    clearCart,
    setDeliveryAddress,
    setNotes,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
