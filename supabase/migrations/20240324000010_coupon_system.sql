-- 1. Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value DECIMAL(12,2) NOT NULL,
  min_purchase_amount DECIMAL(12,2) DEFAULT 0,
  max_discount_amount DECIMAL(12,2), -- Useful for percentage discounts
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER, -- Total times this coupon can be used across all users
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Anyone can view active, non-expired coupons (to check validity)
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
CREATE POLICY "Anyone can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Only admins can manage coupons
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL USING (public.is_admin());

-- 4. Update orders table to track coupon usage
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.coupons(id),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0;
