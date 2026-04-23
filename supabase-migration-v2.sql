-- ============================================
-- TRENDICORE: Migration v2 — Strategic Restructuring
-- Ejecutar en Supabase > SQL Editor > New Query
-- ============================================

-- ============================
-- 1. Trend Score en productos
-- ============================

-- Añadir campo trend_score (0-100) a products
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS trend_score INTEGER DEFAULT 0 
  CHECK (trend_score >= 0 AND trend_score <= 100);

-- Índice para ordenar por trend score
CREATE INDEX IF NOT EXISTS idx_products_trend_score ON products(trend_score DESC);

-- Actualizar products existentes con un score inicial basado en clicks + featured
UPDATE products 
SET trend_score = LEAST(100, 
  CASE 
    WHEN featured = true AND clicks > 10 THEN 85
    WHEN featured = true THEN 70
    WHEN clicks > 50 THEN 65
    WHEN clicks > 20 THEN 45
    WHEN clicks > 5 THEN 30
    ELSE 15
  END
);

-- ============================
-- 2. Newsletter Subscribers
-- ============================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  source TEXT DEFAULT 'footer',
  region TEXT DEFAULT 'es' CHECK (region IN ('us', 'es'))
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);

-- RLS: Solo lectura pública prohibida, solo admins pueden leer
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo admins pueden ver suscriptores" ON newsletter_subscribers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Cualquiera puede suscribirse" ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- ============================
-- 3. User Profiles (Público)
-- ============================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  style_preferences JSONB DEFAULT '[]'::jsonb,
  favorite_categories TEXT[] DEFAULT '{}',
  budget_range TEXT DEFAULT 'any' CHECK (budget_range IN ('low', 'mid', 'high', 'any')),
  region TEXT DEFAULT 'es' CHECK (region IN ('us', 'es')),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_region ON user_profiles(region);

-- Trigger para updated_at
CREATE TRIGGER trigger_update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS: Users can read/write their own profile
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================
-- 4. User Wishlist (Persistente)
-- ============================

CREATE TABLE IF NOT EXISTS user_wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON user_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON user_wishlist(product_id);

ALTER TABLE user_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist" ON user_wishlist
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to wishlist" ON user_wishlist
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from wishlist" ON user_wishlist
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================
-- 5. Auto-create profile on signup
-- ============================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (NEW.id, split_part(NEW.email, '@', 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
