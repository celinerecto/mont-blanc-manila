import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ItemCard from "@/components/cafe/ItemCard";
import RecentReviews from "@/components/cafe/RecentReviews";
import MapPreview from "@/components/map/MapPreview";
import type { Item, Review } from "@/types";

export const revalidate = 60;

async function getLeaderboard(): Promise<Item[]> {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: items } = await supabase
    .from("items")
    .select(`*, cafe:cafes(*), photos(id, storage_url), votes!inner(id, created_at), reviews(rating)`)
    .gte("votes.created_at", sevenDaysAgo)
    .limit(6);

  if (!items) return [];

  return items.map((item) => {
    const weeklyVotes = (item.votes as { id: string; created_at: string }[])?.filter(
      (v) => v.created_at >= sevenDaysAgo
    ).length ?? 0;
    const ratings = (item.reviews as { rating: number }[])?.map((r) => r.rating) ?? [];
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    return { ...item, vote_count: weeklyVotes, avg_rating: avgRating, user_has_voted: false };
  }).sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0));
}

async function getAllItems(): Promise<Item[]> {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: items } = await supabase
    .from("items")
    .select(`*, cafe:cafes(*), photos(id, storage_url), votes(id, created_at), reviews(rating)`)
    .limit(9);

  if (!items) return [];

  return items.map((item) => {
    const weeklyVotes = (item.votes as { id: string; created_at: string }[])?.filter(
      (v) => v.created_at >= sevenDaysAgo
    ).length ?? 0;
    const ratings = (item.reviews as { rating: number }[])?.map((r) => r.rating) ?? [];
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    return { ...item, vote_count: weeklyVotes, avg_rating: avgRating, user_has_voted: false };
  });
}

async function getRecentReviews(): Promise<Review[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select(`*, item:items(*, cafe:cafes(*))`)
    .order("created_at", { ascending: false })
    .limit(5);
  return (data ?? []) as unknown as Review[];
}

async function getMapCafes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cafes")
    .select("id, name, neighborhood, lat, lng, is_verified");
  return data ?? [];
}

export default async function HomePage() {
  const [leaderboard, allItems, recentReviews, mapCafes] = await Promise.all([
    getLeaderboard(),
    getAllItems(),
    getRecentReviews(),
    getMapCafes(),
  ]);

  return (
    <div>
      {/* HERO — minimal, editorial */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-16 pb-12">
        <div className="max-w-2xl">
          <h1 className="font-playfair text-5xl sm:text-6xl lg:text-7xl font-bold text-espresso leading-tight mb-4">
            Manila's Best<br />
            Mont Blanc,<br />
            <span className="text-orange italic">Decided by You.</span>
          </h1>
          <p className="text-brown text-lg leading-relaxed max-w-lg mb-6">
            The community-driven guide to finding the finest Mont Blanc coffees across Manila.
            Vote weekly, read reviews, and discover your next favourite cup.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/browse"
              className="bg-orange text-white font-semibold px-7 py-3 rounded-full hover:bg-orange-hover transition-all duration-200 hover:scale-105"
            >
              Browse All Cafés
            </Link>
            <Link
              href="/leaderboard"
              className="text-espresso font-semibold px-7 py-3 rounded-full border border-brown-border hover:border-orange hover:text-orange transition-all duration-200"
            >
              Full Leaderboard →
            </Link>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="border-t border-brown-border" />

      {/* WEEKLY LEADERBOARD — front and centre */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-orange text-sm font-semibold tracking-widest uppercase mb-1">This Week</p>
            <h2 className="font-playfair text-4xl font-bold text-espresso">Top Mont Blancs 🏆</h2>
          </div>
          <Link href="/leaderboard" className="hidden sm:inline-flex text-sm font-semibold text-orange hover:text-orange-hover transition-colors">
            See full ranking →
          </Link>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-20 border border-brown-border rounded-3xl">
            <div className="text-5xl mb-4">☕</div>
            <p className="font-playfair text-xl font-semibold text-espresso mb-2">No votes yet this week</p>
            <p className="text-brown-muted text-sm mb-5">Be the first to vote and crown this week's champion.</p>
            <Link href="/browse" className="bg-orange text-white font-semibold px-6 py-2.5 rounded-full hover:bg-orange-hover transition-all">
              Browse Cafés
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaderboard.slice(0, 6).map((item, idx) => (
              <ItemCard key={item.id} item={item} rank={idx} showCafe />
            ))}
          </div>
        )}

        <div className="mt-6 text-center sm:hidden">
          <Link href="/leaderboard" className="text-orange font-semibold text-sm">See full ranking →</Link>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="border-t border-brown-border" />

      {/* BROWSE MONT BLANCS */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-orange text-sm font-semibold tracking-widest uppercase mb-1">Explore</p>
            <h2 className="font-playfair text-4xl font-bold text-espresso">Browse Mont Blancs ☕</h2>
          </div>
          <Link href="/browse" className="hidden sm:inline-flex text-sm font-semibold text-orange hover:text-orange-hover transition-colors">
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allItems.map((item, idx) => (
            <ItemCard key={item.id} item={item} rank={idx} showCafe />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/browse" className="bg-orange text-white font-semibold px-8 py-3 rounded-full hover:bg-orange-hover transition-all duration-200 hover:scale-105 inline-block">
            View All Cafés
          </Link>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="border-t border-brown-border" />

      {/* MAP PREVIEW */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-orange text-sm font-semibold tracking-widest uppercase mb-1">Map</p>
            <h2 className="font-playfair text-4xl font-bold text-espresso">Find a Café Near You</h2>
          </div>
          <Link href="/browse" className="hidden sm:inline-flex text-sm font-semibold text-orange hover:text-orange-hover transition-colors">
            Open map →
          </Link>
        </div>
        <div className="h-80 rounded-3xl overflow-hidden border border-brown-border shadow-sm">
          <MapPreview cafes={mapCafes} />
        </div>
      </section>

      {/* DIVIDER */}
      <div className="border-t border-brown-border" />

      {/* RECENT REVIEWS */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14">
        <div className="mb-8">
          <p className="text-orange text-sm font-semibold tracking-widest uppercase mb-1">Community</p>
          <h2 className="font-playfair text-4xl font-bold text-espresso">Fresh Reviews</h2>
        </div>
        <RecentReviews reviews={recentReviews} />
      </section>

      {/* SUBMIT CTA — secondary, understated */}
      <div className="border-t border-brown-border" />
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-playfair text-xl font-semibold text-espresso">Know a hidden gem?</p>
          <p className="text-brown-muted text-sm mt-0.5">Submit a café that's not on our map yet.</p>
        </div>
        <Link
          href="/submit"
          className="text-orange font-semibold border border-orange px-6 py-2.5 rounded-full hover:bg-orange hover:text-white transition-all duration-200 flex-none"
        >
          Submit a Café
        </Link>
      </section>
    </div>
  );
}
