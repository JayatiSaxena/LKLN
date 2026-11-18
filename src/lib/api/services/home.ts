import { supabase } from "../../supabase";

export interface Brand {
  id: number;
  name: string;
  logo_url: string;
  website_url?: string;
}

export interface Category {
  id: number;
  name: string;
  image_url: string;
  description?: string;
  gender: 'men' | 'women' | 'unisex';
}

export interface HomeSection {
  id: number;
  title: string;
  subtitle?: string;
  badge?: string;
  button_text?: string;
  image_url: string;
  target_url?: string;
  type: 'hero' | 'hero-main' | 'hero-side' | 'fashion' | 'brand_deal' | 'limited';
  active: boolean;
}

export const homeService = {
  async getBrands() {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name");

    if (error) throw error;
    return data as Brand[];
  },

  async getCategories(gender?: Category['gender']) {
    let query = supabase.from("categories").select("*");
    if (gender) {
      query = query.or(`gender.eq.${gender},gender.eq.unisex`);
    }
    const { data, error } = await query.order("name");
    if (error) throw error;
    return data as Category[];
  },

  async getHomeSections(type?: HomeSection['type']) {
    let query = supabase
      .from("home_sections")
      .select("*")
      .eq("active", true);

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data as HomeSection[];
  }
};
