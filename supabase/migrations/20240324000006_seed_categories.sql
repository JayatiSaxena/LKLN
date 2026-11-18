-- Seed Categories for LKLN

INSERT INTO public.categories (name)
VALUES 
  ('Men'),
  ('Women'),
  ('Combos'),
  ('Joggers')
ON CONFLICT (name) DO NOTHING;
