export type WishlistItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  color?: string;
  size?: string;
};

const STORAGE_KEY = "mock_wishlist";

export function loadLocalWishlist(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WishlistItem[];
  } catch {
    return [];
  }
}

export function saveLocalWishlist(items: WishlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    try {
      window.dispatchEvent(new CustomEvent("wishlist:updated"));
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }
}
