-- Add moderation status to cafes and reviews
-- New submissions default to 'pending' and are invisible until approved

ALTER TABLE cafes ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Approve all existing cafes and reviews so nothing breaks on deploy
UPDATE cafes SET status = 'approved';
UPDATE reviews SET status = 'approved';

-- Update RLS: public can only read approved cafes
DROP POLICY IF EXISTS "Public read cafes" ON cafes;
CREATE POLICY "Public read approved cafes" ON cafes
  FOR SELECT USING (status = 'approved');

-- Update RLS: public can only read approved reviews
DROP POLICY IF EXISTS "Public read reviews" ON reviews;
CREATE POLICY "Public read approved reviews" ON reviews
  FOR SELECT USING (status = 'approved');
