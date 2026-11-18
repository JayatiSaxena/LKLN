import { supabase } from "../../supabase";

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  phone?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  payment_method: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  quantity: number;
  price_at_time: number;
  size?: string;
  color?: string;
  products?: {
    name: string;
    image_url: string;
    images?: string[];
  };
}

export const orderService = {
  async getAllOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Order[];
  },

  async getOrderDetails(orderId: string) {
    const { data, error } = await supabase
      .from("order_items")
      .select(`
        *,
        products:product_id (
          name,
          image_url,
          images
        )
      `)
      .eq("order_id", orderId);

    if (error) throw error;
    return data as OrderItem[];
  },

  async updateOrderStatus(orderId: string, status: Order['status']) {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  }
};
