import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface CartItem {
  id: string;
  product_id: number;
  quantity: number;
  size?: string;
  color?: string;
  product?: {
    name: string;
    price: number;
    image_url: string;
    category: string;
  };
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  fetchItems: (userId: string) => Promise<void>;
  addItem: (userId: string, item: Omit<CartItem, "id">) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: (userId: string) => Promise<void>;
  subscribeToCart: (userId: string) => () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  fetchItems: async (userId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        product:product_id (name, price, image_url, category)
      `)
      .eq("user_id", userId);
    
    if (!error && data) {
      set({ items: data as CartItem[], loading: false });
    } else {
      set({ loading: false });
    }
  },
  subscribeToCart: (userId) => {
    const channel = supabase
      .channel(`cart_items:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          // Re-fetch items when any change occurs for this user
          // Using fetchItems to handle the join data
          const { data } = await supabase
            .from("cart_items")
            .select(`
              *,
              product:product_id (name, price, image_url, category)
            `)
            .eq("user_id", userId);
          
          if (data) {
            set({ items: data as CartItem[] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
  addItem: async (userId, item) => {
    const { data, error } = await supabase
      .from("cart_items")
      .upsert({ 
        user_id: userId, 
        product_id: item.product_id, 
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }, { onConflict: 'user_id,product_id,size,color' })
      .select(`
        *,
        product:product_id (name, price, image_url, category)
      `)
      .single();

    if (!error && data) {
      const items = get().items;
      const index = items.findIndex(i => i.id === data.id);
      if (index > -1) {
        const newItems = [...items];
        newItems[index] = data as CartItem;
        set({ items: newItems });
      } else {
        set({ items: [...items, data as CartItem] });
      }
    }
  },
  updateQuantity: async (id, quantity) => {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", id);
    
    if (!error) {
      set({
        items: get().items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      });
    }
  },
  removeItem: async (id) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", id);
    if (!error) {
      set({ items: get().items.filter((item) => item.id !== id) });
    }
  },
  clearCart: async (userId) => {
    const { error } = await supabase.from("cart_items").delete().eq("user_id", userId);
    if (!error) {
      set({ items: [] });
    }
  },
}));
