-- ============================================
-- TRENDICORE: Esquema de Base de Datos
-- Ejecutar en Supabase > SQL Editor > New Query
-- ============================================

-- 1. Tabla de productos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('moda-hombre', 'moda-mujer', 'tech', 'entretenimiento')),
  affiliate_link TEXT NOT NULL,
  affiliate_source TEXT DEFAULT 'amazon' CHECK (affiliate_source IN ('amazon', 'shein')),
  region TEXT DEFAULT 'es' CHECK (region IN ('us', 'es')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Índices para rendimiento
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_region ON products(region);

-- 3. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 5. Política: Lectura pública (cualquiera puede ver productos)
CREATE POLICY "Productos visibles para todos"
  ON products
  FOR SELECT
  USING (true);

-- 6. Política: Solo usuarios autenticados pueden insertar/actualizar/eliminar
CREATE POLICY "Solo admins pueden insertar productos"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Solo admins pueden actualizar productos"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo admins pueden eliminar productos"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- 7. Crear bucket de Storage para imágenes de productos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Política de Storage: Cualquiera puede ver las imágenes
CREATE POLICY "Imágenes públicas"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- 9. Política de Storage: Solo autenticados pueden subir imágenes
CREATE POLICY "Admins pueden subir imágenes"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- 10. Política de Storage: Solo autenticados pueden eliminar imágenes
CREATE POLICY "Admins pueden eliminar imágenes"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');
