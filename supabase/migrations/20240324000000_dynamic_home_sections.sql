-- Create BRANDS table
CREATE TABLE IF NOT EXISTS public.brands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create HOME_SECTIONS table
CREATE TABLE IF NOT EXISTS public.home_sections (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  badge TEXT,
  button_text TEXT,
  image_url TEXT NOT NULL,
  target_url TEXT,
  type TEXT NOT NULL, -- 'hero', 'hero-main', 'hero-side', 'fashion', 'brand_deal', 'limited'
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create CATEGORIES table
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  image_url TEXT,
  description TEXT,
  gender TEXT DEFAULT 'unisex', -- 'men', 'women', 'unisex'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public brands are viewable by everyone" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Public home sections are viewable by everyone" ON public.home_sections FOR SELECT USING (true);
CREATE POLICY "Public categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Admin manage policies
CREATE POLICY "Admins can manage brands" ON public.brands FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can manage home sections" ON public.home_sections FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Sample Data for Categories
INSERT INTO public.categories (name, image_url, gender) VALUES 
('T-Shirts', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800', 'unisex'),
('Shirts', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800', 'unisex'),
('Hoodies', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800', 'unisex'),
('Jeans', 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800', 'unisex'),
('Joggers', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800', 'men'),
('Kurti', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', 'women');

-- Sample Data for Brands
INSERT INTO public.brands (name, logo_url) VALUES 
('Nike', 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg'),
('Adidas', 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg'),
('Puma', 'https://upload.wikimedia.org/wikipedia/commons/8/88/Puma_complete_logo.svg'),
('Reebok', 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Reebok_2019_logo.svg'),
('Levis', 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Levi%27s_logo.svg');

-- Sample Data for Home Sections
-- TYPE: 'hero-main' (Big Swiper), 'hero-side' (Double Banner), 'fashion', 'brand_deal', 'limited'
INSERT INTO public.home_sections (title, subtitle, image_url, type, target_url, badge) VALUES 
('Summer\nValue Pack', 'Cool / Colorful / Comfy', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1200', 'hero-main', '/shop', 'T-Shirt / Tops'),
('Modern\nEssentials', 'Elegance in every thread', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=1200', 'hero-main', '/shop', 'New Arrivals'),
('High Coziness', 'UPTO 50% OFF', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800', 'hero-side', '/shop', 'Low Price'),
('Breezy Summer Style', 'UPTO 50% OFF', 'https://images.unsplash.com/photo-1523381235312-3a1647fa9917?auto=format&fit=crop&q=80&w=800', 'hero-side', '/shop', 'Beyoung Presents');
