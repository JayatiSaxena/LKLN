-- 1. Create product_questions table
CREATE TABLE IF NOT EXISTS public.product_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id INTEGER REFERENCES public.products ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  answered_by UUID REFERENCES auth.users,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE
);

-- 2. Add RLS
ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Anyone can read public questions
DROP POLICY IF EXISTS "Anyone can read public questions" ON public.product_questions;
CREATE POLICY "Anyone can read public questions" ON public.product_questions
  FOR SELECT USING (is_public = true);

-- Users can ask questions
DROP POLICY IF EXISTS "Users can ask questions" ON public.product_questions;
CREATE POLICY "Users can ask questions" ON public.product_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only admins can answer (simplified: any admin role in profiles)
DROP POLICY IF EXISTS "Admins can answer questions" ON public.product_questions;
CREATE POLICY "Admins can answer questions" ON public.product_questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
