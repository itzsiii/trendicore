-- ============================================
-- TRENDICORE: Migration v3 — Monetization & B2B API
-- Ejecutar en Supabase > SQL Editor > New Query
-- ============================================

-- 1. Actualizar user_profiles con Tiers y Stripe
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'trendsetter', 'creator_pro')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_user_profiles_tier ON user_profiles(tier);

-- 2. Crear tabla api_keys para acceso B2B
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(api_key);

-- RLS para api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own API keys" ON api_keys
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Crear tabla api_logs para trackear uso del Rate Limit
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Como son logs internos para B2B billing, limitamos a admins/system
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;
