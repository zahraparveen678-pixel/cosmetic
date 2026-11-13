-- ============================================================================
-- Vespera Beauty — Complete Supabase PostgreSQL Schema, RLS Policies & Seed Data
-- Paste this entire script into Supabase SQL Editor and click "Run".
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- TABLE 1: categories
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE CHECK (char_length(trim(name)) > 0),
  group_name TEXT NOT NULL DEFAULT 'Makeup',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_group ON public.categories (group_name);

-- ----------------------------------------------------------------------------
-- TABLE 2: products
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  description TEXT,
  details TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
  is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
  is_trending BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at ASC);

-- ----------------------------------------------------------------------------
-- TABLE 3: customers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2),
  phone TEXT NOT NULL CHECK (char_length(trim(phone)) >= 7),
  email TEXT,
  address TEXT NOT NULL CHECK (char_length(trim(address)) >= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers (phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers (email);

-- ----------------------------------------------------------------------------
-- TABLE 4: orders
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL CHECK (char_length(trim(customer_name)) >= 2),
  phone TEXT NOT NULL CHECK (char_length(trim(phone)) >= 7),
  address TEXT NOT NULL CHECK (char_length(trim(address)) >= 5),
  product_details JSONB NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    order_status IN ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders (phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- ----------------------------------------------------------------------------
-- SUPPORT TABLES: contact_messages & newsletter_subscribers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2),
  email TEXT NOT NULL CHECK (char_length(trim(email)) >= 5),
  subject TEXT NOT NULL DEFAULT 'General Inquiry',
  message TEXT NOT NULL CHECK (char_length(trim(message)) >= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE CHECK (char_length(trim(email)) >= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public read access for categories & active products
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Public read active products"
  ON public.products FOR SELECT TO anon, authenticated USING (is_active = true);

-- Customers & Orders: No direct public SELECT so customer PII stays private.
-- Public visitors submit orders securely through create_customer_order RPC.
DROP POLICY IF EXISTS "Public insert pending orders" ON public.orders;
CREATE POLICY "Public insert pending orders"
  ON public.orders FOR INSERT TO anon, authenticated
  WITH CHECK (order_status = 'pending' AND total_amount > 0);

DROP POLICY IF EXISTS "Public insert contact messages" ON public.contact_messages;
CREATE POLICY "Public insert contact messages"
  ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(trim(name)) >= 2 AND char_length(trim(email)) >= 5 AND char_length(trim(message)) >= 5);

DROP POLICY IF EXISTS "Public insert newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public insert newsletter"
  ON public.newsletter_subscribers FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(trim(email)) >= 5);

-- ----------------------------------------------------------------------------
-- SECURE SERVER-SIDE RPC FUNCTIONS (SECURITY DEFINER)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_customer_order(
  p_customer_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_address TEXT,
  p_notes TEXT,
  p_items JSONB
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
  v_product public.products%ROWTYPE;
  v_qty INTEGER;
  v_subtotal NUMERIC(12, 2) := 0;
  v_shipping NUMERIC(12, 2) := 0;
  v_total NUMERIC(12, 2) := 0;
  v_details JSONB := '[]'::jsonb;
  v_customer_id UUID;
  v_order public.orders%ROWTYPE;
  v_clean_phone TEXT;
  v_prod_id_text TEXT;
BEGIN
  IF char_length(trim(COALESCE(p_customer_name, ''))) < 2 THEN
    RAISE EXCEPTION 'Please enter your full name (at least 2 characters).';
  END IF;

  v_clean_phone := regexp_replace(COALESCE(p_phone, ''), '[^0-9]', '', 'g');
  IF char_length(v_clean_phone) < 7 THEN
    RAISE EXCEPTION 'Please provide a valid phone number with at least 7 digits.';
  END IF;

  IF char_length(trim(COALESCE(p_address, ''))) < 5 THEN
    RAISE EXCEPTION 'Please provide a complete delivery address.';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your shopping bag is empty.';
  END IF;

  -- Upsert or create customer record
  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE regexp_replace(phone, '[^0-9]', '', 'g') = v_clean_phone
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    INSERT INTO public.customers (name, phone, email, address)
    VALUES (trim(p_customer_name), trim(p_phone), NULLIF(trim(COALESCE(p_email, '')), ''), trim(p_address))
    RETURNING id INTO v_customer_id;
  ELSE
    UPDATE public.customers
    SET name = trim(p_customer_name),
        email = COALESCE(NULLIF(trim(COALESCE(p_email, '')), ''), email),
        address = trim(p_address)
    WHERE id = v_customer_id;
  END IF;

  -- Lock and validate each product item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := COALESCE((v_item->>'quantity')::INTEGER, 0);
    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'Item quantity must be at least 1.';
    END IF;

    v_prod_id_text := COALESCE(v_item->>'product_id', '');

    IF v_prod_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      SELECT * INTO v_product FROM public.products WHERE id = v_prod_id_text::UUID AND is_active = true FOR UPDATE;
    ELSE
      SELECT * INTO v_product FROM public.products WHERE name = (v_item->>'product_name') AND is_active = true FOR UPDATE;
    END IF;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product "%" was not found in the active database catalog.', COALESCE(v_item->>'product_name', v_prod_id_text);
    END IF;

    IF v_product.stock < v_qty THEN
      RAISE EXCEPTION 'Insufficient stock for "%" (% remaining).', v_product.name, v_product.stock;
    END IF;

    UPDATE public.products SET stock = stock - v_qty WHERE id = v_product.id;

    v_subtotal := v_subtotal + (v_product.price * v_qty);

    v_details := v_details || jsonb_build_object(
      'product_id', v_product.id,
      'name', v_product.name,
      'category', v_product.category,
      'unit_price', v_product.price,
      'quantity', v_qty,
      'line_total', (v_product.price * v_qty),
      'image_url', v_product.image_url
    );
  END LOOP;

  -- Complimentary shipping on PKR 6,000+, else PKR 250 nationwide courier
  v_shipping := CASE WHEN v_subtotal >= 6000 THEN 0 ELSE 250 END;
  v_total := v_subtotal + v_shipping;

  INSERT INTO public.orders (
    customer_id,
    customer_name,
    phone,
    address,
    product_details,
    total_amount,
    order_status
  )
  VALUES (
    v_customer_id,
    trim(p_customer_name),
    trim(p_phone),
    trim(p_address),
    jsonb_build_object(
      'items', v_details,
      'subtotal', v_subtotal,
      'shipping', v_shipping,
      'payment_method', 'Cash on Delivery',
      'customer_email', NULLIF(trim(COALESCE(p_email, '')), ''),
      'notes', NULLIF(trim(COALESCE(p_notes, '')), '')
    ),
    v_total,
    'pending'
  )
  RETURNING * INTO v_order;

  RETURN v_order;
END;
$$;

CREATE OR REPLACE FUNCTION public.lookup_customer_order(
  p_order_id UUID,
  p_phone TEXT
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_clean_phone TEXT;
BEGIN
  v_clean_phone := regexp_replace(COALESCE(p_phone, ''), '[^0-9]', '', 'g');
  IF char_length(v_clean_phone) < 7 THEN
    RAISE EXCEPTION 'Please enter the phone number associated with this order.';
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
    AND regexp_replace(phone, '[^0-9]', '', 'g') = v_clean_phone;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN v_order;
END;
$$;

CREATE OR REPLACE FUNCTION public.lookup_customer_orders_by_phone(
  p_phone TEXT
)
RETURNS SETOF public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean_phone TEXT;
BEGIN
  v_clean_phone := regexp_replace(COALESCE(p_phone, ''), '[^0-9]', '', 'g');
  IF char_length(v_clean_phone) < 7 THEN
    RAISE EXCEPTION 'Please enter a valid phone number (at least 7 digits).';
  END IF;

  RETURN QUERY
  SELECT *
  FROM public.orders
  WHERE regexp_replace(phone, '[^0-9]', '', 'g') = v_clean_phone
  ORDER BY created_at DESC
  LIMIT 25;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_customer_order(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_customer_order(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_customer_orders_by_phone(TEXT) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- SEED DATA: 20 Categories & 99 Cosmetics Products (PKR)
-- ----------------------------------------------------------------------------
INSERT INTO public.categories (name, group_name, image_url)
VALUES
  ('Lipsticks', 'Makeup', '/images/categories/lipsticks.jpg'),
  ('Lip Gloss', 'Makeup', '/images/categories/lip-gloss.jpg'),
  ('Foundations', 'Makeup', '/images/categories/foundations.jpg'),
  ('Concealers', 'Makeup', '/images/categories/concealers.jpg'),
  ('Face Powders', 'Makeup', '/images/categories/face-powders.jpg'),
  ('Mascaras', 'Makeup', '/images/categories/mascaras.jpg'),
  ('Eyeliners', 'Makeup', '/images/categories/eyeliners.jpg'),
  ('Blush On', 'Makeup', '/images/categories/blush-on.jpg'),
  ('Eyeshadow Palettes', 'Makeup', '/images/categories/eyeshadow-palettes.jpg'),
  ('Makeup Brushes', 'Makeup', '/images/categories/makeup-brushes.jpg'),
  ('Nail Polishes', 'Makeup', '/images/categories/nail-polishes.jpg'),
  ('Face Serums', 'Skincare', '/images/categories/face-serums.jpg'),
  ('Face Wash', 'Skincare', '/images/categories/face-wash.jpg'),
  ('Moisturizers', 'Skincare', '/images/categories/moisturizers.jpg'),
  ('Sunscreens', 'Skincare', '/images/categories/sunscreens.jpg'),
  ('Face Masks', 'Skincare', '/images/categories/face-masks.jpg'),
  ('Toners', 'Skincare', '/images/categories/toners.jpg'),
  ('Perfumes', 'Fragrance & Body Care', '/images/categories/perfumes.jpg'),
  ('Body Lotions', 'Fragrance & Body Care', '/images/categories/body-lotions.jpg'),
  ('Beauty Gift Sets', 'Fragrance & Body Care', '/images/categories/beauty-gift-sets.jpg')
ON CONFLICT (name) DO UPDATE SET
  group_name = EXCLUDED.group_name,
  image_url = EXCLUDED.image_url;

INSERT INTO public.products (
  name, description, details, price, category, image_url, stock,
  is_active, is_featured, is_new_arrival, is_best_seller, is_trending
)
SELECT
  s.name, s.description, s.details, s.price, s.category, s.image_url, s.stock,
  s.is_active, s.is_featured, s.is_new_arrival, s.is_best_seller, s.is_trending
FROM (
  VALUES
  ('Velvet Couture Matte Lipstick — Crimson Silk', 'High-pigment plush matte lipstick enriched with camellia oil for comfortable all-day wear.', '3.8g · Enriched with Vitamin E & Rosehip Butter · Transfer-resistant velvet finish.', 2650, 'Lipsticks', '/images/products/p01.jpg', 28, true, true, false, true, false),
  ('Noir Plum Satin Lip Crème', 'Deep berry-plum satin lipstick delivering rich cushiony pigment in a single effortless glide.', '3.8g · Squalane & Shea Ester conditioning core · Buildable medium-to-full coverage.', 2750, 'Lipsticks', '/images/products/p02.jpg', 22, true, false, true, false, true),
  ('Terracotta Rose Soft Matte Stick', 'Warm clay-rose matte stick designed to flatter South Asian and warm-olive undertones.', '3.5g · Wild Mango Butter · Blurring soft-focus mineral pigments.', 2450, 'Lipsticks', '/images/products/p03.jpg', 30, true, false, false, true, false),
  ('Ruby Petal Cashmere Lipstick', 'Classic blue-toned ruby red in a weightless cashmere-matte formula that resists feathering.', '3.8g · Jojoba Seed Wax · 8-hour comfortable matte wear.', 2700, 'Lipsticks', '/images/products/p04.jpg', 19, true, true, false, false, false),
  ('Mulberry Velvet Moisture Lipstick', 'Soft wine-mulberry shade infused with botanical peptides for visibly smoother lip lines.', '3.8g · Hyaluronic micro-spheres · Paraben-free mineral pigments.', 2550, 'Lipsticks', '/images/products/p05.jpg', 24, true, false, true, false, false),
  ('Champagne Nude Satin Bullet', 'Everyday neutral peach-nude lipstick crafted for effortless day-to-evening luminosity.', '3.8g · Sweet Almond Oil · Subtle vanilla bean essence.', 2400, 'Lipsticks', '/images/products/p06.jpg', 35, true, false, false, true, true),
  ('Rosewood Whisper Demi-Matte', 'Dusty antique rosewater tint with a creamy demi-matte veil and zero dryness.', '3.8g · Meadowfoam Seed Oil · Vegan & cruelty-free.', 2500, 'Lipsticks', '/images/products/p07.jpg', 26, true, false, false, false, false),
  ('Garnet Royal Velvet Lipstick', 'Statement deep garnet evening shade housed in a weighted gold fluted case.', '4.0g · High-density mineral pigment · Magnetic gold cap.', 2800, 'Lipsticks', '/images/products/p08.jpg', 16, true, false, true, false, false),
  ('Rose Quartz Glass Lip Lacquer', 'Mirror-shine hydrating lip gloss infused with rosehip nectar and zero sticky residue.', '6.5ml · Plush doe-foot applicator · Botanical squalane shine.', 2150, 'Lip Gloss', '/images/products/p09.jpg', 32, true, true, false, false, true),
  ('Petal Dew Plumping Lip Oil Gloss', 'Sheer strawberry-blush lip oil gloss with cooling peppermint and conditioning jojoba.', '6.5ml · Cushion-soft glossy film · Non-tacky comfort.', 2250, 'Lip Gloss', '/images/products/p10.jpg', 25, true, false, true, false, false),
  ('Champagne Shimmer Glaze Gloss', 'Micro-pearlescent warm champagne gloss designed to wear solo or layered over matte lipstick.', '6.5ml · Fine light-reflecting mica · Vitamin E nourishment.', 2100, 'Lip Gloss', '/images/products/p11.jpg', 28, true, false, false, true, false),
  ('Spiced Chai Velvet Lip Glaze', 'Warm caramel-rose tinted gloss offering juicy pigment payoff with balm-like hydration.', '6.5ml · Mango butter & avocado oil · Smooth precision wand.', 2200, 'Lip Gloss', '/images/products/p12.jpg', 20, true, false, false, false, false),
  ('Berry Nectar High-Shine Gloss', 'Juicy translucent plum-berry gloss leaving a soft stained glow as the shine wears down.', '6.5ml · Cloudberry oil · Dermatologist tested.', 2300, 'Lip Gloss', '/images/products/p13.jpg', 18, true, false, false, false, true),
  ('Lumière Silk Serum Foundation — Ivory', 'Breathable medium-to-buildable satin foundation infused with niacinamide and hyaluronic acid.', '30ml · Fair neutral-warm undertone · 12-hour luminous finish.', 4650, 'Foundations', '/images/products/p14.jpg', 22, true, true, false, true, false),
  ('Lumière Silk Serum Foundation — Warm Beige', 'Skin-perfecting liquid foundation blending seamlessly into medium golden skin tones.', '30ml · Non-comedogenic · Soft-focus mineral pigments.', 4650, 'Foundations', '/images/products/p15.jpg', 26, true, false, false, true, false),
  ('Velvet Matte Soft-Focus Foundation — Honey', 'Humidity-proof oil-control liquid foundation crafted for warm South Asian complexions.', '30ml · Bamboo silica oil control · Medium-to-full coverage.', 4850, 'Foundations', '/images/products/p16.jpg', 20, true, false, false, false, true),
  ('Satin Second-Skin Foundation — Sand', 'Weightless serum-textured foundation that blurs pores while letting natural skin radiance shine.', '30ml · Light-medium neutral · SPF-friendly flash-safe formula.', 4700, 'Foundations', '/images/products/p17.jpg', 18, true, false, true, false, false),
  ('Couture Radiance Cushion Foundation — Golden', 'Travel-friendly luminous compact foundation for effortless touch-ups with a silky finish.', '15g + Puff · Medium golden undertone · Refillable case.', 5100, 'Foundations', '/images/products/p18.jpg', 15, true, false, false, false, false),
  ('Velvet Matte Soft-Focus Foundation — Espresso', 'True rich cocoa-bronze foundation engineered to stay color-true without oxidizing.', '30ml · Deep neutral-warm · Long-wear breathable film.', 4850, 'Foundations', '/images/products/p19.jpg', 17, true, false, false, false, false),
  ('Radiant Brightening Wand Concealer — Fair Linen', 'Crease-resistant creamy concealer enriched with caffeine to brighten dark under-eye shadows.', '6ml · Light neutral-peach · Soft-matte radiant finish.', 2850, 'Concealers', '/images/products/p20.jpg', 24, true, false, false, true, false),
  ('Radiant Brightening Wand Concealer — Warm Sand', 'Flexible medium-full coverage concealer that melts into skin without settling into fine lines.', '6ml · Medium warm undertone · 12-hour crease-free wear.', 2850, 'Concealers', '/images/products/p21.jpg', 28, true, true, false, false, false),
  ('Peach Corrector Under-Eye Elixir', 'Color-correcting apricot-peach concealer formulated to neutralize deep under-eye darkness.', '6ml · Squalane + Vitamin C · Weightless fluid texture.', 2750, 'Concealers', '/images/products/p22.jpg', 21, true, false, false, false, true),
  ('Full-Cover Velvet Spot Concealer — Honey', 'High-coverage blurring concealer that camouflages blemishes and redness in one tap.', '6ml · Non-acnegenic · Tea tree & centella extract.', 2900, 'Concealers', '/images/products/p23.jpg', 19, true, false, false, false, false),
  ('Radiant Brightening Wand Concealer — Rich Caramel', 'Luminous caramel-toned concealer for sculpting, highlighting, and seamless under-eye brightening.', '6ml · Deep golden undertone · Dermatologist tested.', 2850, 'Concealers', '/images/products/p24.jpg', 16, true, false, true, false, false),
  ('Silk Veil Translucent Pressed Powder', 'Ultra-finely milled pressed setting powder in a champagne compact with velvet puff.', '10g · Zero white cast · Blurs texture & controls T-zone shine.', 3650, 'Face Powders', '/images/products/p25.jpg', 24, true, true, false, true, false),
  ('Soft-Focus Banana Setting Compact', 'Subtle warm-ivory brightening powder crafted to set under-eye concealer cleanly.', '10g · Talc-free oat silk base · Built-in vanity mirror.', 3550, 'Face Powders', '/images/products/p26.jpg', 20, true, false, false, false, true),
  ('Velvet Matte Mineral Foundation Powder', 'Buildable wet-or-dry pressed mineral powder offering breathable everyday complexion perfection.', '11g · Rosehip & silk amino acids · Medium buildable coverage.', 3800, 'Face Powders', '/images/products/p27.jpg', 18, true, false, false, false, false),
  ('Champagne Glow Baked Finishing Powder', 'Terracotta-baked luminous finishing veil imparting a candlelit soft-focus glow.', '9g · Micro-pearlescent warmth · Never glittery.', 3950, 'Face Powders', '/images/products/p28.jpg', 15, true, false, true, false, false),
  ('Lash Elevate Volumizing Mascara — Noir', 'Hourglass-bristle plum-and-gold mascara delivering dramatic lash lift and smudge-free volume.', '10ml · Panthenol lash conditioning · Ophthalmologist tested.', 2950, 'Mascaras', '/images/products/p29.jpg', 30, true, true, false, true, false),
  ('Feather Curl Lengthening Mascara', 'Curved precision brush lifts and separates every lash from root to tip without clumping.', '10ml · Rice bran wax · Flake-resistant 14-hour hold.', 2850, 'Mascaras', '/images/products/p30.jpg', 24, true, false, true, false, false),
  ('Waterproof Silk Lash Coat Mascara', 'Monsoon-proof tubing mascara that resists humidity and rinses off cleanly with warm water.', '10ml · Safe for sensitive eyes & contact lens wearers.', 3050, 'Mascaras', '/images/products/p31.jpg', 22, true, false, false, false, true),
  ('Espresso Brown Soft Volume Mascara', 'Rich dark chocolate-plum mascara ideal for natural daytime definition and soft editorial looks.', '10ml · Castor oil & biotin complex · Buildable definition.', 2900, 'Mascaras', '/images/products/p32.jpg', 18, true, false, false, false, false),
  ('Luminé Precision Liquid Eyeliner Pen', 'Ultra-fine Japanese calligraphy brush tip delivering razor-sharp matte black wings.', '1.2ml · Waterproof & smudge-proof · Dries in 5 seconds.', 2150, 'Eyeliners', '/images/products/p33.jpg', 34, true, false, false, true, false),
  ('Obsidian Kohl Velvet Gel Pencil', 'Creamy glide-on kohl waterline pencil with intense carbon-free mineral pigment.', '1.4g · Safe for tightlining · Built-in smudger tip.', 1850, 'Eyeliners', '/images/products/p34.jpg', 28, true, true, false, false, false),
  ('Deep Plum Satin Wing Liner', 'Rich aubergine-plum liquid liner crafted to make brown and hazel eyes luminous.', '1.2ml · Flexible felt tip · 16-hour crease-proof wear.', 2200, 'Eyeliners', '/images/products/p35.jpg', 20, true, false, true, false, false),
  ('Champagne Bronze Shimmer Eye Pencil', 'Warm metallic bronze-gold gel liner for effortless inner-corner brightening and smoky lids.', '1.4g · Jojoba wax glide · Waterproof once set.', 1950, 'Eyeliners', '/images/products/p36.jpg', 22, true, false, false, false, false),
  ('Rose Garden Baked Silk Blush', 'Embossed floral baked powder blush in soft petal rose for a natural flushed radiance.', '6.5g · Champagne gold mirrored compact · Silky buildable glow.', 3150, 'Blush On', '/images/products/p37.jpg', 26, true, true, false, true, false),
  ('Peony Flush Velvet Cream-to-Powder Blush', 'Bouncy cream-to-powder blush melting seamlessly into skin for a sunlit rosy cheek.', '6g · Rosehip & squalane infused · Finger or brush application.', 3250, 'Blush On', '/images/products/p38.jpg', 22, true, false, false, false, true),
  ('Apricot Sunbeam Mineral Blush Compact', 'Warm peach-apricot matte-satin blush brightening dull complexions effortlessly.', '6.5g · Talc-free mineral milled · Long-wearing.', 3100, 'Blush On', '/images/products/p39.jpg', 20, true, false, false, false, false),
  ('Spiced Fig Sculpting Matte Blush', 'Sophisticated terracotta-berry blush tailored for medium-to-deep skin tones.', '6.5g · Buildable velvety matte · Mirror & mini brush included.', 3200, 'Blush On', '/images/products/p40.jpg', 17, true, false, true, false, false),
  ('Champagne Petal Duo Blush & Highlight', 'Two-in-one sculpted cheek compact pairing soft dusty rose blush with champagne sheen.', '8g · Light-diffusing pearls · Compact travel mirror.', 3450, 'Blush On', '/images/products/p41.jpg', 19, true, false, false, false, false),
  ('Rose & Cocoa 12-Shade Atelier Palette', 'Twelve velvety mattes and champagne-plum shimmers curated for bridal and evening glamour.', '16g · Full-size mirror · Zero-fallout buttery pigments.', 5850, 'Eyeshadow Palettes', '/images/products/p42.jpg', 20, true, true, false, true, true),
  ('Gilded Petal 9-Pan Nude Palette', 'Nine wearable soft-rose, toasted peach, and champagne glaze shades for everyday elegance.', '12g · Gold mirrored compact · Blendable cream-powder feel.', 4950, 'Eyeshadow Palettes', '/images/products/p43.jpg', 24, true, false, true, true, false),
  ('Plum Nocturne Smoky Eye Edit', 'Rich espresso, smoked plum, and antique bronze foils for sultry sculpted eyes.', '16g · Intense metallic foil shimmers · Long-wear binder.', 5600, 'Eyeshadow Palettes', '/images/products/p44.jpg', 15, true, false, false, false, false),
  ('Sunlit Champagne Quad Compact', 'Pocket-sized four-pan eyeshadow edit featuring silk sand, rose quartz, bronze, and cocoa.', '6g · Ideal for handbag & travel · Wet/dry application.', 3750, 'Eyeshadow Palettes', '/images/products/p45.jpg', 22, true, false, false, false, false),
  ('Bridal Luminance Master Palette', 'Curated luxury celebratory palette combining soft neutrals, rose gold shimmers, and deep liner tones.', '18g · Luxury keepsake palette · Dermatologist tested.', 6400, 'Eyeshadow Palettes', '/images/products/p46.jpg', 14, true, false, false, false, true),
  ('Atelier 5-Piece Plum & Gold Brush Set', 'Five hand-sculpted vegan taklon brushes with deep plum handles and champagne gold ferrules.', 'Includes Powder, Blush, Foundation, Blending & Precision Eye brushes.', 4900, 'Makeup Brushes', '/images/products/p47.jpg', 20, true, true, false, true, false),
  ('Velvet Kabuki Foundation Buffing Brush', 'Dense angled synthetic kabuki brush for streak-free liquid and cream foundation blending.', 'Cruelty-free ultra-plush bristles · Weighted aluminum ferrule.', 1950, 'Makeup Brushes', '/images/products/p48.jpg', 26, true, false, false, false, false),
  ('Rose Gold Eye Blending Trio', 'Three essential fluffy crease, flat shader, and detail smudger brushes for seamless eye looks.', '3 Brushes · Hypoallergenic fibers · Easy-clean ferrules.', 2450, 'Makeup Brushes', '/images/products/p49.jpg', 24, true, false, true, false, false),
  ('Fluffy Cloud Powder & Bronzer Brush', 'Generously domed ultra-soft brush designed to diffuse setting powder and baked blush evenly.', '100% synthetic cashmere-feel fibers · Ergonomic plum handle.', 2150, 'Makeup Brushes', '/images/products/p50.jpg', 22, true, false, false, false, false),
  ('Mauve Éclat Gel-Shine Nail Lacquer', '10-free high-gloss dusty rose-mauve nail lacquer with UV-shielded gel-like plumping finish.', '12ml · Wide fan brush · Breathable & chip-resistant 7 days.', 1350, 'Nail Polishes', '/images/products/p51.jpg', 35, true, true, false, false, true),
  ('Crimson Velvet Atelier Nail Enamel', 'Timeless deep crimson-red polish offering opaque single-coat richness and mirror shine.', '12ml · Vegan 10-free formula · Quick-dry top coat compatible.', 1350, 'Nail Polishes', '/images/products/p52.jpg', 30, true, false, false, true, false),
  ('Blush Porcelain Sheer Nail Veil', 'Milky soft-blush sheer lacquer giving nails a clean, polished French-manicure glow.', '12ml · Enriched with bamboo extract · Zero yellowing.', 1250, 'Nail Polishes', '/images/products/p53.jpg', 32, true, false, false, false, false),
  ('Champagne Gold Foil Nail Lacquer', 'Luminous liquid champagne-gold shimmer polish crafted for festive celebrations.', '12ml · Fine reflective pearl · Smooth even streak-free laydown.', 1450, 'Nail Polishes', '/images/products/p54.jpg', 24, true, false, true, false, false),
  ('Deep Plum Noir Glass Nail Lacquer', 'Dramatic dark cherry-plum enamel with high-gloss lacquer depth and glossy wear.', '12ml · Formaldehyde-free & toluene-free.', 1400, 'Nail Polishes', '/images/products/p55.jpg', 22, true, false, false, false, false),
  ('Luminous Hyaluronic 2% Plumping Serum', 'Multi-molecular hyaluronic acid and rosewater essence delivering deep 48-hour skin hydration.', '30ml · Frosted glass dropper · Fragrance-free & non-sticky.', 4250, 'Face Serums', '/images/products/p56.jpg', 26, true, true, false, true, false),
  ('Golden Botanical Glow Oil Elixir', 'Cold-pressed sea buckthorn, squalane, and rosehip facial oil for instant glass-skin radiance.', '30ml · 100% pure cold-pressed botanical lipids · Night & day use.', 4950, 'Face Serums', '/images/products/p57.jpg', 18, true, false, true, false, true),
  ('Vitamin C 15% Radiance Dropper Serum', 'Stabilized L-ascorbic ester and ferulic complex targeting uneven tone and post-blemish marks.', '30ml · UV-protective amber glass · Gentle low-irritation pH.', 4550, 'Face Serums', '/images/products/p58.jpg', 24, true, false, false, true, false),
  ('Niacinamide 10% + Zinc Pore Clarifying Serum', 'Balancing oil-control serum refining visible pores and strengthening compromised skin barriers.', '30ml · Ideal for combination & humid climates · Oil-free.', 3650, 'Face Serums', '/images/products/p59.jpg', 30, true, false, false, false, false),
  ('Bakuchiol Gentle Renewal Night Serum', 'Plant-based retinol alternative paired with chamomile oil to smooth fine lines without peeling.', '30ml · Safe for sensitive skin · Overnight elasticity boost.', 4800, 'Face Serums', '/images/products/p60.jpg', 16, true, false, true, false, false),
  ('Peptide Firming & Barrier Repair Drops', 'Concentrated bio-peptide complex restoring bounce and calming redness in stressed skin.', '30ml · Copper & tripeptide blend · Dermatologist tested.', 5100, 'Face Serums', '/images/products/p61.jpg', 15, true, false, false, false, false),
  ('Rose & Oat Gentle Foaming Facial Cleanser', 'Cloud-soft sulfate-free foaming wash with Damascus rose and oat amino acids for daily purity.', '150ml · pH 5.5 balanced · Leaves skin plush, never tight.', 2250, 'Face Wash', '/images/products/p62.jpg', 32, true, true, false, true, false),
  ('Olive & Geranium Botanical Cleansing Oil', 'Silky rinse-off oil cleanser dissolving waterproof mascara and sunscreen without clogging pores.', '120ml · Emulsifies cleanly with warm water · Zero mineral oil.', 2950, 'Face Wash', '/images/products/p63.jpg', 24, true, false, false, false, true),
  ('Chamomile Velvet Milk Cream Wash', 'Soothing non-foaming cream cleanser formulated specifically for dry, sensitive complexions.', '150ml · Glycerin & bisabolol · Fragrance-free comfort.', 2400, 'Face Wash', '/images/products/p64.jpg', 22, true, false, false, false, false),
  ('Green Tea & Salicylic Clarifying Gel Wash', 'Refreshing botanical gel wash with 0.5% BHA and willow bark to keep pores clear in summer heat.', '150ml · Non-stripping coconut surfactants · Daily use.', 2350, 'Face Wash', '/images/products/p65.jpg', 28, true, false, true, false, false),
  ('Honey & Rice Bran Brightening Cleanser', 'Silky brightening wash infused with fermented rice water to gently polish dull skin.', '150ml · Micro-refined botanical enzymes · Radiant rinse.', 2450, 'Face Wash', '/images/products/p66.jpg', 20, true, false, false, false, false),
  ('Lumina Peptides & Hyaluronic Crème', 'Whipped cashmere-textured daily moisturizer sealing hydration with biomimetic peptides.', '50ml · Frosted glass jar · Smooth base under makeup.', 4150, 'Moisturizers', '/images/products/p67.jpg', 24, true, true, false, true, false),
  ('Ceramide Barrier Recovery Night Cream', 'Deeply restorative ceramide NP/AP and oat lipid cream repairing dry winter skin overnight.', '50ml · Stone-capped apothecary jar · Non-comedogenic.', 4350, 'Moisturizers', '/images/products/p68.jpg', 20, true, false, false, false, true),
  ('Rosewater Cloud Gel-Cream Moisturizer', 'Featherweight oil-free gel moisturizer bursting with rosewater hydration for humid days.', '50ml · Instant cooling absorption · Zero greasiness.', 3650, 'Moisturizers', '/images/products/p69.jpg', 28, true, false, true, false, false),
  ('Squalane & Shea Silk Day Cream', 'Rich botanical barrier cream replenishing radiance without heaviness or synthetic fragrance.', '50ml · Olive squalane + shea butter · All skin types.', 3900, 'Moisturizers', '/images/products/p70.jpg', 19, true, false, false, false, false),
  ('Centella Calming Moisture Balm', 'Soothing cica and panthenol moisture balm formulated to calm redness after sun exposure.', '50ml · Dermatologist approved · Alcohol-free.', 3800, 'Moisturizers', '/images/products/p71.jpg', 22, true, false, false, false, false),
  ('Solstice Sheer Mineral SPF 50 PA++++', 'Weightless broad-spectrum daily sunscreen with zero white cast and a soft satin finish.', '75ml · UVA/UVB shield · Layers invisibly under foundation.', 3250, 'Sunscreens', '/images/products/p72.jpg', 34, true, true, false, true, true),
  ('Hydra-Dew Serum Sun Fluid SPF 50', 'Hyaluronic-infused fluid sunscreen offering dewy moisture and sun protection in one step.', '60ml · Reef-safe filters · Non-eye-stinging formula.', 3400, 'Sunscreens', '/images/products/p73.jpg', 26, true, false, true, false, false),
  ('Velvet Matte Oil-Control Sun Gel SPF 50', 'Breathable soft-matte sun gel tailored for oily and combination skin in warm climates.', '60ml · Niacinamide infused · Sweat & humidity resistant.', 3300, 'Sunscreens', '/images/products/p74.jpg', 25, true, false, false, false, false),
  ('Tinted Peach Glow Mineral SPF 45', 'Lightly tinted mineral sunscreen evening out skin tone while defending against UV & blue light.', '50ml · Iron oxide protection · Natural radiant tint.', 3550, 'Sunscreens', '/images/products/p75.jpg', 20, true, false, false, false, false),
  ('Soothing Aloe & Chamomile Sun Milk SPF 50', 'Gentle soothing sun milk safe for sensitive and reactive skin types.', '75ml · Fragrance-free · No greasy film.', 3150, 'Sunscreens', '/images/products/p76.jpg', 22, true, false, false, false, false),
  ('Luna Rose Kaolin Purifying Clay Mask', 'Creamy French pink clay and rosehip mask that draws out congestion without cracking or drying.', '120g · Includes wooden & gold spatula · Weekly detox ritual.', 2950, 'Face Masks', '/images/products/p77.jpg', 24, true, true, false, true, false),
  ('Saffron & Honey Overnight Glow Mask', 'Velvety sleeping mask infused with saffron extract and wildflower honey for luminous mornings.', '100g · Leave-on overnight treatment · Cushioning texture.', 3450, 'Face Masks', '/images/products/p78.jpg', 18, true, false, false, false, true),
  ('Oat & Calendula Soothing Recovery Mask', 'Calming botanical gel-cream mask relieving tightness and irritation in 10 minutes.', '120g · Colloidal oatmeal + calendula · Rinse with lukewarm water.', 2850, 'Face Masks', '/images/products/p79.jpg', 20, true, false, true, false, false),
  ('Matcha & Charcoal Pore Refining Mask', 'Antioxidant-rich clay treatment balancing T-zone oiliness and smoothing skin texture.', '120g · Micro-fine bamboo charcoal · Non-drying mineral clay.', 3050, 'Face Masks', '/images/products/p80.jpg', 16, true, false, false, false, false),
  ('Damascus Rosewater Hydrating Essence Toner', 'Steam-distilled organic rose petal hydrosol infused with glycerin to hydrate and prep skin.', '200ml · Alcohol-free glass bottle · Balances pH after cleansing.', 2450, 'Toners', '/images/products/p81.jpg', 30, true, true, false, true, false),
  ('AHA 5% Glycolic Glow Resurfacing Toner', 'Gentle lactic and glycolic exfoliating essence revealing smoother, brighter skin clarity.', '200ml · Aloe vera buffered · Evening routine 3x weekly.', 2750, 'Toners', '/images/products/p82.jpg', 22, true, false, false, false, true),
  ('Chamomile & Neroli Calming Facial Mist', 'Ultra-fine refreshing botanical mist soothing heated skin and setting mineral powder.', '150ml · Fine atomizer spray · Travel-friendly glass.', 2350, 'Toners', '/images/products/p83.jpg', 25, true, false, true, false, false),
  ('Rice Ceramide Milky Hydration Toner', 'Nourishing milky essence toner softening dehydrated skin prior to serums.', '200ml · Fermented rice + ceramides · Fragrance-free.', 2650, 'Toners', '/images/products/p84.jpg', 21, true, false, false, false, false),
  ('Aura Rosa Eau de Parfum — 100ml', 'Luminous signature fragrance blending Taif rose, pink pepper, pear blossom, and warm cashmere musk.', '100ml · Faceted crystal decanter · 10-hour skin longevity.', 9850, 'Perfumes', '/images/products/p85.jpg', 16, true, true, false, true, true),
  ('Aurum Amber & Oud Eau de Parfum — 100ml', 'Opulent evening elixir marrying smoked golden amber, saffron threads, sandalwood, and soft oud.', '100ml · Hammered brass cap · Rich extrait concentration.', 11200, 'Perfumes', '/images/products/p86.jpg', 14, true, false, true, true, false),
  ('Jardin de Jasmin Eau de Parfum — 75ml', 'Fresh moonlit Arabian jasmine petals layered over crisp bergamot and creamy white cedar.', '75ml · Fine French fragrance oils · Signature gift box.', 8450, 'Perfumes', '/images/products/p87.jpg', 18, true, true, false, false, false),
  ('Velvet Vanilla & Fig Extrait — 100ml', 'Sensual gourmand blend of Madagascar vanilla bean, ripe black fig, and roasted tonka.', '100ml · Warm resinous dry-down · Day-to-night wear.', 10500, 'Perfumes', '/images/products/p88.jpg', 12, true, false, false, false, true),
  ('Eau de Lumière Citrus Blossom — 50ml', 'Radiant daytime perfume featuring Sicilian neroli, white tea, and sunlit peony petals.', '50ml · Light airy sillage · Ideal for warm afternoons.', 6950, 'Perfumes', '/images/products/p89.jpg', 22, true, false, false, false, false),
  ('Peony Silk Hair & Body Mist — 75ml', 'Delicate alcohol-light veil scenting hair and skin with soft blush peonies and white musk.', '75ml · Conditioning panthenol mist · Zero hair dryness.', 4450, 'Perfumes', '/images/products/p90.jpg', 24, true, false, true, false, false),
  ('Almond Blossom & Shea Silk Body Lotion', 'Fast-absorbing velvety body lotion infused with sweet almond blossom, shea butter, and vitamin E.', '400ml · Ceramic-finish pump bottle · 24-hour silk softness.', 3150, 'Body Lotions', '/images/products/p91.jpg', 26, true, true, false, true, false),
  ('Rose & Cashmere Whipped Body Crème', 'Indulgent scented body cream enveloping dry skin in Damascus rose and warm sandalwood.', '350ml · Rich non-greasy butter melt · Dermatologist tested.', 3450, 'Body Lotions', '/images/products/p92.jpg', 20, true, false, true, false, false),
  ('Oat & Vanilla Barrier Body Milk', 'Soothing daily body milk crafted for sensitive skin needing gentle moisture replenishment.', '400ml · Oat lipid complex · Subtle warm vanilla aroma.', 2950, 'Body Lotions', '/images/products/p93.jpg', 24, true, false, false, false, false),
  ('Golden Argan Radiance Body Oil-Lotion', 'Luminous satin body emulsion leaving arms and collarbones softly hydrated with a natural sheen.', '350ml · Cold-pressed Moroccan argan · Quick dry.', 3350, 'Body Lotions', '/images/products/p94.jpg', 18, true, false, false, false, true),
  ('Collection Noir Bridal & Festive Coffret', 'Deep plum ribbon-tied keepsake box housing Aura Rosa EDP, Velvet Matte Lipstick, and Glow Serum.', '3 Full-Size Icons · Satin-lined rigid gift box · Complimentary gift card.', 14950, 'Beauty Gift Sets', '/images/products/p95.jpg', 12, true, true, false, true, true),
  ('Maison Satin Trio Luxury Gift Set', 'Curated celebration bundle featuring full-size Eau de Parfum, Pressed Powder Compact, and Rose Serum.', '3 Full-Size Pieces · Champagne ribbon wrap · Ready to gift.', 13500, 'Beauty Gift Sets', '/images/products/p96.jpg', 14, true, false, true, false, false),
  ('Essential Glass-Skin Morning Ritual Set', 'Three-step daily skincare wardrobe pairing our Facial Cleanser, Vitamin C Serum, and Peptide Crème.', '3 Full-Size Skincare Bottles · All skin types · Save 15%.', 9800, 'Beauty Gift Sets', '/images/products/p97.jpg', 16, true, false, false, true, false),
  ('Evening Glam Lip & Eye Gift Box', 'Complete evening makeup edit with Rose & Cocoa Palette, Velvet Lipstick, and Precision Eyeliner.', '3 Full-Size Makeup Favorites · Keepsake plum coffret.', 8950, 'Beauty Gift Sets', '/images/products/p98.jpg', 15, true, false, false, false, false),
  ('Botanical Apothecary Spa Retreat Set', 'Restorative spa collection with Rose Clay Mask, Chamomile Mist, Facial Elixir, and Silk Body Lotion.', '4 Full-Size Spa Essentials · Perfect wedding or Eid gift.', 10900, 'Beauty Gift Sets', '/images/products/p99.jpg', 11, true, false, true, false, false)
) AS s(name, description, details, price, category, image_url, stock, is_active, is_featured, is_new_arrival, is_best_seller, is_trending)
WHERE NOT EXISTS (SELECT 1 FROM public.products LIMIT 1);

-- Link foreign keys category_id on seeded products
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category = c.name
  AND p.category_id IS NULL;
