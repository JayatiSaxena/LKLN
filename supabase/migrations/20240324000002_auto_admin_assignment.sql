-- Automatic Admin Assignment for sgosain18122001@gmail.com

-- Update the trigger function to automatically assign admin role to the requested email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN new.email = 'sgosain18122001@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Force update any existing profile with this email to be an admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'sgosain18122001@gmail.com';
