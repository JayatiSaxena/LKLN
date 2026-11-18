-- 1. Create return_requests table
CREATE TABLE IF NOT EXISTS public.return_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  images TEXT[] DEFAULT '{}',
  admin_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add RLS
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Users can see/create their own returns
DROP POLICY IF EXISTS "Users can manage their own returns" ON public.return_requests;
CREATE POLICY "Users can manage their own returns" ON public.return_requests
  FOR ALL USING (auth.uid() = user_id);

-- Admins can manage all returns
DROP POLICY IF EXISTS "Admins can manage all returns" ON public.return_requests;
CREATE POLICY "Admins can manage all returns" ON public.return_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 4. Function to update updated_at
CREATE OR REPLACE FUNCTION update_return_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_update_return_timestamp
  BEFORE UPDATE ON public.return_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_return_timestamp();
