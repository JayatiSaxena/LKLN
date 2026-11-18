-- Backfill profiles for auth users that have none (accounts created before the trigger existed)
INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
SELECT u.id,
       COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
       u.email,
       COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture', ''),
       CASE WHEN EXISTS (SELECT 1 FROM public.admin_emails a WHERE lower(a.email) = lower(u.email)) THEN 'admin' ELSE 'user' END
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- Safety net: a signed-in user may create ONLY their own profile, and only with role 'user'
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id AND role = 'user');

-- Profiles never had created_at; add it so "Member Since" is accurate
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
NOTIFY pgrst, 'reload schema';
