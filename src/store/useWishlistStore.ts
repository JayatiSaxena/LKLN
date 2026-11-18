import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface WishlistState {
  items: string[]; // Array of product IDs
  loading: boolean;
  fetchWishlist: (userId: string) => Promise<void>;
  fetchItems: (userId: string) => Promise<void>;
  toggleWishlist: (userId: string, productId: string | number) => Promise<void>;
  toggleItem: (userId: string, productId: string | number) => Promise<void>;
  isInWishlist: (productId: string | number) => boolean;
  subscribeToWishlist: (userId: string) => () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async (userId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', userId);

      if (error) throw error;
      set({ items: data?.map((i: any) => String(i.product_id)) || [] });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      set({ loading: false });
    }
  },

  toggleWishlist: async (userId: string, productId: string | number) => {
    const { items } = get();
    const pid = String(productId);
    const isWishlisted = items.includes(pid);

    try {
      if (isWishlisted) {
        // Remove
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', pid);
        if (error) throw error;
        set({ items: items.filter(id => id !== pid) });
      } else {
        // Add
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: userId, product_id: pid });
        if (error) throw error;
        set({ items: [...items, pid] });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  },

  toggleItem: async (userId: string, productId: string | number) => {
    await get().toggleWishlist(userId, productId);
  },

  subscribeToWishlist: (userId: string) => {
    const channel = supabase
      .channel(`wishlist_changes_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlist',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          get().fetchWishlist(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  fetchItems: async (userId: string) => {
    await get().fetchWishlist(userId);
  },

  isInWishlist: (productId: string | number) => {
    return get().items.includes(String(productId));
  }
}));
