-- OPTIONAL: run in the Supabase SQL editor AFTER customer@lkln.com has signed up.
-- Creates 2 demo orders (with items) so the admin Orders/Customers tabs have data.
DO $$
DECLARE cid UUID; oid UUID;
BEGIN
  SELECT id INTO cid FROM public.profiles WHERE lower(email) = 'customer@lkln.com';
  IF cid IS NULL OR EXISTS (SELECT 1 FROM public.orders WHERE user_id = cid) THEN RETURN; END IF;

  INSERT INTO public.orders (user_id, total_amount, status, shipping_address, payment_method, phone, city, state, zip_code)
  VALUES (cid, 4698, 'delivered', '12 Park Street', 'COD', '9999999999', 'Ghaziabad', 'Uttar Pradesh', '201001') RETURNING id INTO oid;
  INSERT INTO public.order_items (order_id, product_id, quantity, price_at_time, size, color)
  SELECT oid, id, 1, price, 'M', 'Black' FROM public.products WHERE sku IN ('LKLN-HD-001','LKLN-SW-002');

  INSERT INTO public.orders (user_id, total_amount, status, shipping_address, payment_method, phone, city, state, zip_code)
  VALUES (cid, 2299, 'processing', '12 Park Street', 'COD', '9999999999', 'Ghaziabad', 'Uttar Pradesh', '201001') RETURNING id INTO oid;
  INSERT INTO public.order_items (order_id, product_id, quantity, price_at_time, size, color)
  SELECT oid, id, 1, price, 'L', 'Black' FROM public.products WHERE sku = 'LKLN-JG-007';
END $$;
