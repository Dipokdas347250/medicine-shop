"use client";

import { useSyncExternalStore } from "react";
import { COUPONS, PRODUCTS, SHOP, slugify } from "./data";

const STORAGE_KEY = "medicare-store-v1";

const initialState = {
  products: PRODUCTS,
  cart: [], // [{ id, qty }]
  wishlist: [], // [productId]
  coupon: null, // coupon code
  orders: [],
  reviews: {}, // { [productId]: [{ id, name, rating, comment, date }] }
  recent: [], // recently viewed product ids
  prescriptions: [],
  users: [],
  user: null,
  adminAuthed: false,
  theme: "light",
};

// Keys that are kept only for the current tab session.
const VOLATILE_KEYS = ["adminAuthed"];

let state = null;
const listeners = new Set();

function load() {
  if (typeof window === "undefined") return initialState;
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved) return initialState;
    return { ...initialState, ...saved, adminAuthed: false };
  } catch {
    return initialState;
  }
}

function persist() {
  try {
    const toSave = { ...state };
    VOLATILE_KEYS.forEach((k) => delete toSave[k]);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Storage full or blocked; keep working in memory.
  }
}

function getState() {
  if (state === null) state = load();
  return state;
}

function getServerState() {
  return initialState;
}

function setState(patch) {
  const current = getState();
  const next = typeof patch === "function" ? patch(current) : patch;
  state = { ...current, ...next };
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  const onStorage = (e) => {
    if (e.key === STORAGE_KEY) {
      state = { ...load(), adminAuthed: getState().adminAuthed };
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useStore(selector) {
  const s = useSyncExternalStore(subscribe, getState, getServerState);
  return selector ? selector(s) : s;
}

const noopSubscribe = () => () => {};
/** False during server render and hydration, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/* ------------------------------ Selectors ------------------------------ */

export const publishedProducts = (s) => s.products.filter((p) => p.published);

export function getProductRating(product, reviews = []) {
  const count = product.reviews + reviews.length;
  if (!count) return { rating: 0, count: 0 };
  const total = product.rating * product.reviews + reviews.reduce((sum, r) => sum + r.rating, 0);
  return { rating: Math.round((total / count) * 10) / 10, count };
}

export function cartLines(s) {
  return s.cart
    .map((line) => {
      const product = s.products.find((p) => p.id === line.id);
      return product && product.published ? { ...line, product } : null;
    })
    .filter(Boolean);
}

export function computeTotals(s, deliveryType = "standard") {
  const lines = cartLines(s);
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const mrpTotal = lines.reduce((sum, l) => sum + l.product.mrp * l.qty, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);
  const coupon = s.coupon ? COUPONS[s.coupon] : null;
  const couponValid = coupon && subtotal >= coupon.min;

  let discount = 0;
  if (couponValid && coupon.type === "percent") discount = Math.round((subtotal * coupon.value) / 100);
  if (couponValid && coupon.type === "flat") discount = coupon.value;

  const freeShip = subtotal >= SHOP.freeDeliveryOver || (couponValid && coupon.type === "shipping");
  let delivery = lines.length === 0 ? 0 : freeShip ? 0 : SHOP.deliveryFee;
  if (lines.length && deliveryType === "express") delivery += SHOP.expressFee;

  const total = Math.max(0, subtotal - discount + delivery);
  const needsRx = lines.some((l) => l.product.rx);
  return {
    lines, subtotal, mrpTotal, savings: mrpTotal - subtotal, itemCount, discount,
    delivery, total, needsRx, coupon: couponValid ? s.coupon : null, couponCode: s.coupon,
    couponError: coupon && !couponValid ? `Minimum order ৳${coupon.min} for ${s.coupon}` : null,
  };
}

/* ------------------------------- Actions ------------------------------- */

export const actions = {
  addToCart(id, qty = 1) {
    const s = getState();
    const product = s.products.find((p) => p.id === id);
    if (!product || product.stock <= 0) return false;
    const existing = s.cart.find((l) => l.id === id);
    const newQty = Math.min(product.stock, (existing?.qty || 0) + qty);
    setState({
      cart: existing ? s.cart.map((l) => (l.id === id ? { ...l, qty: newQty } : l)) : [...s.cart, { id, qty: newQty }],
    });
    return true;
  },
  setQty(id, qty) {
    const s = getState();
    const product = s.products.find((p) => p.id === id);
    if (qty <= 0) return actions.removeFromCart(id);
    setState({ cart: s.cart.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, product?.stock ?? qty) } : l)) });
  },
  removeFromCart(id) {
    setState((s) => ({ cart: s.cart.filter((l) => l.id !== id) }));
  },
  clearCart() {
    setState({ cart: [], coupon: null });
  },
  toggleWishlist(id) {
    const s = getState();
    const has = s.wishlist.includes(id);
    setState({ wishlist: has ? s.wishlist.filter((w) => w !== id) : [...s.wishlist, id] });
    return !has;
  },
  addToWishlist(id) {
    setState((s) => (s.wishlist.includes(id) ? {} : { wishlist: [...s.wishlist, id] }));
  },
  applyCoupon(code) {
    const c = code.trim().toUpperCase();
    if (!COUPONS[c]) return false;
    setState({ coupon: c });
    return true;
  },
  removeCoupon() {
    setState({ coupon: null });
  },
  addRecent(id) {
    setState((s) => ({ recent: [id, ...s.recent.filter((r) => r !== id)].slice(0, 8) }));
  },
  addReview(productId, review) {
    setState((s) => ({
      reviews: {
        ...s.reviews,
        [productId]: [{ id: `r${Date.now()}`, date: new Date().toISOString(), ...review }, ...(s.reviews[productId] || [])],
      },
    }));
  },
  placeOrder({ customer, deliveryType, payment, prescription, note }) {
    const s = getState();
    const totals = computeTotals(s, deliveryType);
    if (!totals.lines.length) return null;
    const order = {
      id: `MC${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      status: "Placed",
      history: [{ status: "Placed", date: new Date().toISOString() }],
      items: totals.lines.map((l) => ({
        id: l.product.id, name: l.product.name, strength: l.product.strength, unit: l.product.unit,
        price: l.product.price, qty: l.qty, rx: l.product.rx, form: l.product.form, color: l.product.color, image: l.product.image,
      })),
      customer, deliveryType, payment, prescription: prescription || null, note: note || "",
      subtotal: totals.subtotal, discount: totals.discount, delivery: totals.delivery, total: totals.total, coupon: totals.coupon,
      userEmail: s.user?.email || null,
    };
    setState({
      orders: [order, ...s.orders],
      cart: [],
      coupon: null,
      products: s.products.map((p) => {
        const line = totals.lines.find((l) => l.product.id === p.id);
        return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
      }),
    });
    return order;
  },
  cancelOrder(orderId) {
    const s = getState();
    const order = s.orders.find((o) => o.id === orderId);
    if (!order || !["Placed", "Confirmed"].includes(order.status)) return false;
    setState({
      orders: s.orders.map((o) =>
        o.id === orderId ? { ...o, status: "Cancelled", history: [...o.history, { status: "Cancelled", date: new Date().toISOString() }] } : o
      ),
      products: s.products.map((p) => {
        const item = order.items.find((i) => i.id === p.id);
        return item ? { ...p, stock: p.stock + item.qty } : p;
      }),
    });
    return true;
  },
  reorder(orderId) {
    const s = getState();
    const order = s.orders.find((o) => o.id === orderId);
    if (!order) return 0;
    let added = 0;
    order.items.forEach((i) => {
      if (actions.addToCart(i.id, i.qty)) added++;
    });
    return added;
  },
  submitPrescription(data) {
    const entry = { id: `RX${Date.now().toString().slice(-6)}`, date: new Date().toISOString(), status: "Pending review", ...data };
    setState((s) => ({ prescriptions: [entry, ...s.prescriptions] }));
    return entry;
  },

  /* Accounts (demo only: stored in the browser, not secure) */
  register({ name, email, phone, password }) {
    const s = getState();
    const e = email.trim().toLowerCase();
    if (s.users.some((u) => u.email === e)) return { error: "An account with this email already exists." };
    const user = { name: name.trim(), email: e, phone: phone.trim(), password, addresses: [], joined: new Date().toISOString() };
    setState({ users: [...s.users, user], user: stripPassword(user) });
    return { user };
  },
  login(email, password) {
    const s = getState();
    const u = s.users.find((x) => x.email === email.trim().toLowerCase());
    if (!u || u.password !== password) return { error: "Invalid email or password." };
    setState({ user: stripPassword(u) });
    return { user: u };
  },
  logout() {
    setState({ user: null });
  },
  updateProfile(patch) {
    const s = getState();
    if (!s.user) return;
    const user = { ...s.user, ...patch };
    setState({ user, users: s.users.map((u) => (u.email === user.email ? { ...u, ...patch } : u)) });
  },
  saveAddress(address) {
    const s = getState();
    if (!s.user) return;
    const addresses = s.user.addresses || [];
    if (addresses.some((a) => a.address === address.address && a.city === address.city)) return;
    actions.updateProfile({ addresses: [...addresses, { id: `a${Date.now()}`, ...address }] });
  },
  removeAddress(id) {
    const s = getState();
    if (!s.user) return;
    actions.updateProfile({ addresses: (s.user.addresses || []).filter((a) => a.id !== id) });
  },

  setTheme(theme) {
    setState({ theme });
    document.documentElement.classList.toggle("dark", theme === "dark");
  },

  /* Admin */
  adminLogin(password) {
    if (password !== "admin123") return false;
    setState({ adminAuthed: true });
    return true;
  },
  adminLogout() {
    setState({ adminAuthed: false });
  },
  saveProduct(product) {
    const s = getState();
    const exists = s.products.some((p) => p.id === product.id);
    const slugBase = slugify(`${product.name} ${product.strength || ""}`);
    const slugTaken = s.products.some((p) => p.slug === slugBase && p.id !== product.id);
    const next = { ...product, slug: slugTaken ? `${slugBase}-${product.id}` : slugBase };
    setState({ products: exists ? s.products.map((p) => (p.id === product.id ? next : p)) : [next, ...s.products] });
    return next;
  },
  deleteProduct(id) {
    setState((s) => ({
      products: s.products.filter((p) => p.id !== id),
      cart: s.cart.filter((l) => l.id !== id),
      wishlist: s.wishlist.filter((w) => w !== id),
    }));
  },
  togglePublish(id) {
    setState((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, published: !p.published } : p)) }));
  },
  setOrderStatus(orderId, status) {
    setState((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId && o.status !== status
          ? { ...o, status, history: [...o.history, { status, date: new Date().toISOString() }] }
          : o
      ),
    }));
  },
  setPrescriptionStatus(id, status) {
    setState((s) => ({ prescriptions: s.prescriptions.map((p) => (p.id === id ? { ...p, status } : p)) }));
  },
  resetDemo() {
    const theme = getState().theme;
    state = { ...initialState, theme, adminAuthed: true };
    persist();
    listeners.forEach((l) => l());
  },
};

function stripPassword(u) {
  const { password, ...rest } = u;
  return rest;
}

export const ORDER_STATUSES = ["Placed", "Confirmed", "Packed", "Shipped", "Delivered"];
