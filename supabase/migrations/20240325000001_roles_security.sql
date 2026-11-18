-- Role security: admin allowlist, role-escalation guard, orders->profiles FK

CREATE TABLE IF NOT EXISTS public.admin_emails (email TEXT PRIMARY KEY);
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY; -- no policies: not readable from the client
INSERT INTO public.admin_emails (email) VALUES ('admin@lkln.com'), ('sgosain18122001@gmail.com') ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    CASE WHEN EXISTS (SELECT 1 FROM public.admin_emails a WHERE lower(a.email) = lower(new.email)) THEN 'admin' ELSE 'user' END
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name, avatar_url = EXCLUDED.avatar_url, updated_at = now();
  RETURN new;
END;
$$;

-- Promote already-registered allowlisted accounts
UPDATE public.profiles SET role = 'admin' WHERE lower(email) IN (SELECT lower(email) FROM public.admin_emails);

-- Only admins (or the SQL editor / service role) may change a role
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF new.role IS DISTINCT FROM old.role AND auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'You are not allowed to change roles';
  END IF;
  RETURN new;
END;
$$;
DROP TRIGGER IF EXISTS protect_profile_role ON public.profiles;
CREATE TRIGGER protect_profile_role BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- Allows PostgREST to embed profiles in orders (admin order list)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_user_id_profiles_fkey') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_user_id_profiles_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
