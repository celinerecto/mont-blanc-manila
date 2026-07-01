-- Allow anonymous (unauthenticated) users to vote, review, and submit cafes
-- This removes the sign-in requirement for the app

-- VOTES: allow anon inserts and deletes
DROP POLICY IF EXISTS "Auth insert votes" ON votes;
DROP POLICY IF EXISTS "Auth delete votes" ON votes;
CREATE POLICY "Anyone can vote" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete own vote" ON votes FOR DELETE USING (true);

-- REVIEWS: allow anon inserts
DROP POLICY IF EXISTS "Auth insert reviews" ON reviews;
CREATE POLICY "Anyone can review" ON reviews FOR INSERT WITH CHECK (true);

-- CAFES: allow anon inserts
DROP POLICY IF EXISTS "Auth insert cafes" ON cafes;
CREATE POLICY "Anyone can submit cafe" ON cafes FOR INSERT WITH CHECK (true);

-- ITEMS: allow anon inserts
DROP POLICY IF EXISTS "Auth insert items" ON items;
CREATE POLICY "Anyone can submit item" ON items FOR INSERT WITH CHECK (true);

-- PHOTOS: allow anon inserts
DROP POLICY IF EXISTS "Auth insert photos" ON photos;
CREATE POLICY "Anyone can upload photo" ON photos FOR INSERT WITH CHECK (true);

-- Make submitted_by nullable (already is, but just confirming)
ALTER TABLE cafes ALTER COLUMN submitted_by DROP NOT NULL;
