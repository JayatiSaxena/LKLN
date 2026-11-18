-- Fix Order Items RLS Policies

-- 1. Ensure RLS is enabled for order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 2. Add INSERT policy for order items
-- Users can insert items if they belong to an order they own
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;
CREATE POLICY "Users can insert their own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_id
      AND orders.user_id = auth.uid()
    )
  );

-- 3. Ensure SELECT policy is also robust
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );
