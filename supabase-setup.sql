-- ============================================
-- SQL Script για Supabase: ERP Τέντες & Πέργκολες
-- ============================================

-- 1. Δημιουργία Πίνακα Κατηγοριών
CREATE TABLE IF NOT EXISTS "Κατηγορίες" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Δημιουργία Πίνακα Προϊόντων
CREATE TABLE IF NOT EXISTS "Προιόντα" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES "Κατηγορίες"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Εισαγωγή Κατηγοριών
INSERT INTO "Κατηγορίες" (id, name) VALUES
  ('1', 'Τέντες'),
  ('2', 'Πέργκολες'),
  ('3', 'Στόρια'),
  ('4', 'Ρολά')
ON CONFLICT (id) DO NOTHING;

-- 4. Εισαγωγή Προϊόντων Πέργκολες (category_id='2')
INSERT INTO "Προιόντα" (id, name, category_id) VALUES
  ('18', 'Σύστημα Πέργκολας Προ 100', '2'),
  ('19', 'Σύστημα Πέργκολας Προ 150', '2'),
  ('20', 'Σύστημα Πέργκολας Προ Mega', '2'),
  ('21', 'Σύστημα Πέργκολας Curved', '2'),
  ('22', 'Πέργκολα Στάνταρ Μοτέρ Κουτί', '2'),
  ('23', 'Πέργκολα Κρεμαστή', '2'),
  ('24', 'Πέργκολα Flat', '2'),
  ('25', 'Πέργκολα Βιοκλιματική', '2'),
  ('26', 'Πέργκολα Open Sky', '2'),
  ('27', 'Πέργκολα Open Roof', '2'),
  ('28', 'Πέργκολα Σταθερές Περσίδες', '2'),
  ('29', 'Πέργκολα Balloon', '2'),
  ('30', 'Πέργκολα Δανάη', '2')
ON CONFLICT (id) DO NOTHING;

-- 5. Εισαγωγή Προϊόντων Τέντες (category_id='1')
INSERT INTO "Προιόντα" (id, name, category_id) VALUES
  ('1', 'Τέντα Κασετίνα 530', '1'),
  ('2', 'Κασέτα 732', '1'),
  ('3', 'Epica', '1'),
  ('4', 'Κάθετο Zip Screen', '1'),
  ('5', 'Κάθετο Κασονέτο Συρματόσχοινα', '1'),
  ('6', 'Κάθετο Κασονέτο Φ10', '1'),
  ('7', 'Κάθετο ΒΤ', '1')
ON CONFLICT (id) DO NOTHING;

-- 6. Enable Row Level Security (προαιρετικά - για ασφάλεια)
ALTER TABLE "Κατηγορίες" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Προιόντα" ENABLE ROW LEVEL SECURITY;

-- 7. Δημιουργία Policies για Public Read Access
CREATE POLICY "Allow public read access on Κατηγορίες"
  ON "Κατηγορίες" FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on Προϊόντα"
  ON "Προιόντα" FOR SELECT
  USING (true);

-- ============================================
-- Τέλος Script
-- ============================================
