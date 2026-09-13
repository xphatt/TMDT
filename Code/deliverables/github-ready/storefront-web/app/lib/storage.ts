import type { CartItem, MockOrder } from "../types";

const CART_KEY = "tra-sua-ngon:cart:v1";
const ORDERS_KEY = "tra-sua-ngon:orders:v1";

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CART_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as CartItem[];
  return Array.isArray(parsed) ? parsed : [];
}

export function saveCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function saveOrder(order: MockOrder) {
  const raw = window.localStorage.getItem(ORDERS_KEY);
  const existing = raw ? (JSON.parse(raw) as MockOrder[]) : [];
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...existing].slice(0, 10)));
}
