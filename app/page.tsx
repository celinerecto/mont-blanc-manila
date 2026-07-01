import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ItemCard from "@/components/cafe/ItemCard";
import RecentReviews from "@/components/cafe/RecentReviews";
import MapPreview from "@/components/map/MapPreview";
import type { Item, Review } from "@/types";

export const revalidate = 60;

async function getLeaderboard(userId?: string): Promise<Item[]> {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: items } = await supabase
    .from("items")
    .select(`
      *,
      cafe:cafes(*),
      photos(id, storage_url),
      votes!inner(id, created_at),
      reviews(rating)
    `)
    .gte("votes.created_at", sevenDaysAgo)
    .limit(6);

  if (!items) return [];

  return items.map((item) => {
    const weeklyVotes = (item.votes as { id: string; created_at: string }[])?.filter(
      (v) => v.created_at >= sevenDaysAgo
    ).length ?? 0;
    const ratings = (item.reviews as { rating: number }[])?.map((r) => r.rating) ?? [];
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    return {
      ...item,
      vote_count: weeklyVotes,
      avg_rating: avgRating,
      user_has_voted: userId
        ? (item.votes as { id: string }[]).some(() => false)
        : false,
    };
  }).sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0));
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
  const [leaderboard, recentReviews, mapCafes] = await Promise.all([
    getLeaderboard(),
    getRecentReviews(),
    getMapCafes(),
  ]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cream via-orange-pale to-orange/20 px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🏔️</span>
              <span className="text-sm font-semibold text-orange tracking-widest uppercase">Manila's Coffee Community</span>
            </div>
            <h1 className="font-playfair text-5xl sm:text-6xl lg:text-7xl font-black text-espresso leading-tight mb-6">
              Manila's Best<br />
              Mont Blanc,<br />
              <span className="text-orange italic">Decided by You</span>{" "}
              <span className="not-italic">☕</span>
            </h1>
            <p className="text-brown text-lg sm:text-xl mb-8 leading-relaxed max-w-lg">
              Discover, vote, and review the finest Mont Blanc coffees across Manila's best cafés.
              A new weekly champion is crowned every Sunday.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/browse"
                className="bg-orange text-white font-bold px-8 py-4 rounded-full hover:bg-orange-hover transition-all duration-200 hover:scale-105 shadow-lg shadow-orange/30 text-base"
              >
                Browse All Cafés
              </Link>
              <Link
                href="/leaderboard"
                className="bg-cream-surface text-espresso font-bold px-8 py-4 rounded-full border-2 border-brown-border hover:border-orange hover:text-orange transition-all duration-200 text-base"
              >
                This Week's Ranking 🏆
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative coffee cups */}
        <div className="absolute right-0 top-0 bottom-0 hidden lg:flex items-center justify-center w-1/3 pointer-events-none select-none">
          <div className="text-[180px] opacity-10 font-black">☕</div>
        </div>
      </section>

      {/* WEEKLY LEADERBOARD */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-espresso">
              This Week's Top Picks 🏆
            </h2>
            <p className="text-brown-muted mt-1">Votes reset every Sunday. Cast yours now!</p>
          </div>
          <Link
            href="/leaderboard"
            className="hidden sm:inline-flex text-orange font-semibold text-sm hover:text-orange-hover transition-colors items-center gap-1"
          >
            Full leaderboard →
          </Link>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-16 bg-cream-surface rounded-3xl border border-brown-border">
            <div className="text-5xl mb-4">☕</div>
            <p className="text-espresso font-playfair text-xl font-semibold mb-2">No votes yet this week!</p>
            <p className="text-brown-muted text-sm">Be the first to vote and crown this week's champion.</p>
            <Link href="/browse" className="mt-4 inline-block bg-orange text-white font-semibold px-6 py-2.5 rounded-full hover:bg-orange-hover transition-all">
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
          <Link href="/leaderboard" className="text-orange font-semibold text-sm hover:text-orange-hover transition-colors">
            See full leaderboard →
          </Link>
        </div>
      </section>

      {/* MAP PREVIEW */}
      <section className="bg-cream-surface border-y border-brown-border py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-playfair text-3xl font-bold text-espresso">Find a Café Near You</h2>
              <p className="text-brown-muted mt-1">{mapCafes.length} cafés mapped across Manila</p>
            </div>
            <Link href="/browse" className="text-orange font-semibold text-sm hover:text-orange-hover transition-colors hidden sm:inline-flex items-center gap-1">
              See all on map →
            </Link>
          </div>
          <div className="h-80 rounded-3xl overflow-hidden border border-brown-border shadow-md">
            <MapPreview cafes={mapCafes} />
          </div>
          <div className="mt-4 text-center sm:hidden">
            <Link href="/browse" className="text-orange font-semibold text-sm">See all on map →</Link>
          </div>
        </div>
      </section>

      {/* RECENT REVIEWS */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-playfair text-3xl font-bold text-espresso mb-8">Fresh Reviews ☕</h2>
        <RecentReviews reviews={recentReviews} />
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange to-orange-hover py-16 text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-5xl mb-4">🏔️</div>
          <h2 className="font-playfair text-3xl font-bold mb-3">Know a Hidden Gem?</h2>
          <p className="text-white/80 mb-6">Submit a café not yet on our map and help the community discover Manila's best-kept Mont Blanc secrets.</p>
          <Link
            href="/submit"
            className="bg-white text-orange font-bold px-8 py-4 rounded-full hover:bg-cream transition-all duration-200 hover:scale-105 inline-block"
          >
            Submit a Café
          </Link>
        </div>
      </section>
    </div>
  );
}
