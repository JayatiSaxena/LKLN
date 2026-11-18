import { supabase } from "../../supabase";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  rating: number;
  reviews_count: number;
  is_new: boolean;
  is_trending: boolean;
  stock_quantity: number;
  created_at: string;
  images?: string[]; // Optional to support legacy image_url
  sku?: string | null;
  brand?: string | null;
  gender?: string | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  material?: string | null;
  fit?: string | null;
  care_instructions?: string | null;
  original_price?: number | null;
  tags?: string[] | null;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  is_new?: boolean;
  is_trending?: boolean;
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest";
  limit?: number;
  offset?: number;
}

export const productService = {
  async getProducts(filters?: ProductFilters): Promise<{ products: Product[]; totalCount: number }> {
    let query = supabase.from("products").select("*", { count: "exact" });

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.is_new !== undefined) {
      query = query.eq("is_new", filters.is_new);
    }

    if (filters?.is_trending !== undefined) {
      query = query.eq("is_trending", filters.is_trending);
    }

    if (filters?.search) {
      // Use text search for better results
      query = query.ilike("name", `%${filters.search}%`);
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }

    // Sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case "price_asc":
          query = query.order("price", { ascending: true });
          break;
        case "price_desc":
          query = query.order("price", { ascending: false });
          break;
        case "rating":
          query = query.order("rating", { ascending: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
      }
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Pagination
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    
    return {
      products: data as Product[],
      totalCount: count || 0
    };
  },

  async getProductById(id: number) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data as Product;
  },

  async getCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("name")
      .order("name");
    
    if (error) throw error;
    return data.map(c => c.name);
  },

  async createProduct(product: Omit<Product, "id" | "created_at" | "rating" | "reviews_count">) {
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          ...product,
          rating: 0,
          reviews_count: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  async updateProduct(id: number, product: Partial<Product>) {
    const { data, error } = await supabase
      .from("products")
      .update(product)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  async deleteProduct(id: number) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },
};
