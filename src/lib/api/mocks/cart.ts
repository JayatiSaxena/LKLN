// No default product imports; mock cart starts empty.

export const DEFAULT_CART = {
  items: [] as Array<{ id: number; name: string; color: string; size?: string; price: number; quantity: number; image: string }>,
  savings: 0,
  shipping: 0,
};

export type LocalCart = typeof DEFAULT_CART;

export function calculateTotals(cart: LocalCart) {
  const subtotal = cart.items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const savings = cart.savings ?? 0;
  const shipping = cart.shipping ?? 0;
  const total = subtotal - savings + shipping;
  return { subtotal, savings, shipping, total };
}

const STORAGE_KEY = "mock_cart";

export function loadLocalCart(): LocalCart {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CART;
    const parsed = JSON.parse(raw) as LocalCart;
    return parsed;
  } catch {
    return DEFAULT_CART;
  }
}

export function saveLocalCart(cart: LocalCart) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    // notify listeners within the same tab
    try {
      window.dispatchEvent(new CustomEvent("cart:updated"));
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }
}
