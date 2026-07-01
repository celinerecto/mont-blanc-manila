-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CAFES
CREATE TABLE cafes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  website TEXT,
  hours TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ITEMS (Mont Blanc offerings)
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Mont Blanc',
  variant TEXT, -- iced, hot, cold brew, etc.
  price DECIMAL(10, 2),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PHOTOS
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(item_id, user_id)
);

-- VOTES (one per user per item per week)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL, -- ISO week number
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_id, week_number, year)
);

-- INDEXES
CREATE INDEX idx_items_cafe_id ON items(cafe_id);
CREATE INDEX idx_photos_item_id ON photos(item_id);
CREATE INDEX idx_photos_cafe_id ON photos(cafe_id);
CREATE INDEX idx_reviews_item_id ON reviews(item_id);
CREATE INDEX idx_votes_item_id ON votes(item_id);
CREATE INDEX idx_votes_week ON votes(week_number, year);
CREATE INDEX idx_cafes_neighborhood ON cafes(neighborhood);

-- ROW LEVEL SECURITY
ALTER TABLE cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read cafes" ON cafes FOR SELECT USING (true);
CREATE POLICY "Public read items" ON items FOR SELECT USING (true);
CREATE POLICY "Public read photos" ON photos FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public read votes" ON votes FOR SELECT USING (true);

-- Authenticated write access
CREATE POLICY "Auth insert cafes" ON cafes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert items" ON items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert photos" ON photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth insert votes" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth delete votes" ON votes FOR DELETE USING (auth.uid() = user_id);

-- VOTE COUNT VIEW (aggregated per item, last 7 days)
CREATE VIEW weekly_vote_counts AS
SELECT
  item_id,
  COUNT(*) AS vote_count
FROM votes
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY item_id;

-- LEADERBOARD VIEW
CREATE VIEW leaderboard AS
SELECT
  i.id AS item_id,
  i.name AS item_name,
  i.variant,
  i.price,
  c.id AS cafe_id,
  c.name AS cafe_name,
  c.neighborhood,
  c.is_verified,
  COUNT(DISTINCT v.id) FILTER (WHERE v.created_at >= NOW() - INTERVAL '7 days') AS weekly_votes,
  COUNT(DISTINCT v.id) AS lifetime_votes,
  ROUND(AVG(r.rating), 1) AS avg_rating,
  COUNT(DISTINCT r.id) AS review_count
FROM items i
JOIN cafes c ON c.id = i.cafe_id
LEFT JOIN votes v ON v.item_id = i.id
LEFT JOIN reviews r ON r.item_id = i.id
GROUP BY i.id, i.name, i.variant, i.price, c.id, c.name, c.neighborhood, c.is_verified
ORDER BY weekly_votes DESC;

-- SEED DATA
INSERT INTO cafes (name, address, neighborhood, lat, lng, website, hours, is_verified) VALUES
(
  '% Arabica BGC',
  'Bonifacio High Street, 9th Ave, Taguig, 1634 Metro Manila',
  'BGC',
  14.5504, 121.0497,
  'https://arabica.coffee',
  'Mon–Sun 8:00 AM – 9:00 PM',
  true
),
(
  'The Curious Cat',
  '5765 Felipe St, Poblacion, Makati, 1210 Metro Manila',
  'Poblacion',
  14.5655, 121.0277,
  NULL,
  'Tue–Sun 11:00 AM – 10:00 PM',
  true
),
(
  'Belle & Dragon',
  'Molito Lifestyle Center, Alabang, Muntinlupa, 1780 Metro Manila',
  'Alabang',
  14.4232, 121.0290,
  NULL,
  'Mon–Sun 9:00 AM – 8:00 PM',
  true
),
(
  'Yardstick Coffee',
  '109 Esteban St, Legazpi Village, Makati, 1229 Metro Manila',
  'Makati',
  14.5591, 121.0199,
  'https://yardstickcoffee.com',
  'Mon–Fri 7:00 AM – 7:00 PM, Sat–Sun 8:00 AM – 6:00 PM',
  true
),
(
  'Han''s Café',
  '2/F Eastwood Mall, Bagumbayan, Quezon City, 1110 Metro Manila',
  'Eastwood',
  14.6063, 121.0826,
  NULL,
  'Mon–Sun 10:00 AM – 10:00 PM',
  true
);

-- Seed items for each cafe
WITH cafe_ids AS (
  SELECT id, name FROM cafes
)
INSERT INTO items (cafe_id, name, variant, price, description)
SELECT
  c.id,
  'Mont Blanc',
  v.variant,
  v.price,
  v.description
FROM cafe_ids c
JOIN (VALUES
  ('% Arabica BGC', 'Iced', 385, 'Silky chestnut cream layered over their signature espresso blend, served over ice with a dusting of cocoa.'),
  ('% Arabica BGC', 'Hot', 365, 'Warm chestnut milk topped with velvety foam — a cozy autumn-in-a-cup experience.'),
  ('The Curious Cat', 'Iced', 290, 'House-made chestnut purée blended with cold brew and oat milk — rich, nutty, irresistible.'),
  ('Belle & Dragon', 'Iced', 320, 'A South Manila favourite: chestnut latte with a hint of vanilla and crunchy mont blanc crumble on top.'),
  ('Yardstick Coffee', 'Iced', 340, 'Single-origin espresso with artisanal chestnut paste from Batangas — clean, bright, and deeply satisfying.'),
  ('Yardstick Coffee', 'Hot', 320, 'Their winter special — warm, comforting and made with locally-sourced chestnuts.'),
  ('Han''s Café', 'Iced', 250, 'A crowd-pleasing iced chestnut latte at a wallet-friendly price point.')
) AS v(cafe_name, variant, price, description) ON c.name = v.cafe_name;
