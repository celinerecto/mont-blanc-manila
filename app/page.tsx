import { createClient } from "@/lib/supabase/server";
import ItemCard from "@/components/cafe/ItemCard";
import RecentReviews from "@/components/cafe/RecentReviews";
import BrowseSection from "@/components/cafe/BrowseSection";
import MapPreview from "@/components/map/MapPreview";
import Link from "next/link";
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
  return items
    .map((item) => {
      const weeklyVotes = (item.votes as { id: string; created_at: string }[])?.filter(
        (v) => v.created_at >= sevenDaysAgo
      ).length ?? 0;
      const ratings = (item.reviews as { rating: number }[])?.map((r) => r.rating) ?? [];
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      return { ...item, vote_count: weeklyVotes, avg_rating: avgRating, user_has_voted: false };
    })
    .sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0));
}

async function getAllItems(): Promise<Item[]> {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: items } = await supabase
    .from("items")
    .select(`*, cafe:cafes(*), photos(id, storage_url), votes(id, created_at), reviews(rating)`)
    .order("created_at", { ascending: false });
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
  const { data } = await supabase.from("cafes").select("id, name, neighborhood, lat, lng, is_verified");
  return data ?? [];
}

export default async function HomePage() {
  const [leaderboard, allItems, recentReviews, mapCafes] = await Promise.all([
    getLeaderboard(), getAllItems(), getRecentReviews(), getMapCafes(),
  ]);

  return (
    <div className="bg-white">

      {/* PAGE HEADER */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-10 pb-6">
        <p className="font-playfair text-xl text-espresso leading-snug">
          Mont Blancs of Manila
        </p>
        <p className="text-brown-muted text-sm mt-1">
          A digital guide to the best Mont Blanc&apos;s in the city.
        </p>
      </div>

      <div className="border-t border-brown-border" />

      {/* LEADERBOARD */}
      <section id="leaderboard" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-brown-muted mb-1">This week</p>
          <h2 className="font-playfair text-3xl text-espresso">Top Mont Blancs</h2>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-16 bg-[#f5f5f3] rounded-2xl">
            <div className="text-5xl mb-4">☕</div>
            <p className="font-playfair text-xl text-espresso mb-2">No votes yet this week</p>
            <p className="text-brown-muted text-sm">Be the first to vote and crown this week&apos;s champion.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaderboard.slice(0, 6).map((item, idx) => (
              <ItemCard key={item.id} item={item} rank={idx} showCafe />
            ))}
          </div>
        )}
      </section>

      <div className="border-t border-brown-border" />

      {/* BROWSE */}
      <section id="browse" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-brown-muted mb-1">Explore</p>
          <h2 className="font-playfair text-3xl text-espresso">Find a Mont Blanc near me</h2>
        </div>
        <BrowseSection items={allItems} cafes={mapCafes} />
      </section>

      <div className="border-t border-brown-border" />

      {/* WHAT IS A MONT BLANC */}
      <section id="about" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-brown-muted mb-1">The drink</p>
          <h2 className="font-playfair text-3xl text-espresso">What is a Mont Blanc?</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-5 text-brown leading-relaxed">
            <p>
              The Mont Blanc is a coffee drink named after the iconic snow-capped peak on the French-Italian border.
              It is traditionally made with a shot of espresso topped with a generous cloud of sweetened cream —
              the white peak mirroring the mountain it was named for.
            </p>
            <p>
              The drink as Manila knows it was popularised by{" "}
              <span className="font-semibold text-espresso">Good Measure</span>, a café in Fitzroy, Melbourne, Australia.
              Good Measure began serving their version — a double ristretto crowned with lightly whipped cream — and the
              drink quickly became a cult favourite, eventually finding its way to the hands of Filipino café owners
              who brought the concept home.
            </p>
            <p>
              Today, Manila&apos;s café scene has embraced the Mont Blanc wholeheartedly, with each café putting its
              own spin on the ratio of espresso to cream, the sweetness level, and whether the cream is poured, piped,
              or spooned on top.
            </p>
          </div>

          <div className="bg-[#f5f5f3] rounded-2xl p-8">
            <h3 className="font-playfair text-xl text-espresso mb-5">What goes into a Mont Blanc</h3>
            <ul className="space-y-4">
              {[
                {
                  name: "Espresso or Ristretto",
                  desc: "The base is a concentrated coffee shot — usually a double. A ristretto pull (shorter, sweeter) is common for a cleaner, less bitter base.",
                },
                {
                  name: "Heavy cream",
                  desc: "Lightly whipped to a soft, pourable consistency — thick enough to sit on top of the coffee without immediately dissolving.",
                },
                {
                  name: "Sugar (optional)",
                  desc: "Some cafés sweeten the cream with simple syrup or vanilla. Others let the cream stay unsweetened to contrast the espresso.",
                },
                {
                  name: "The ratio",
                  desc: "The balance of coffee to cream is the signature of each café. This is what separates a great Mont Blanc from a good one.",
                },
              ].map((item) => (
                <li key={item.name} className="flex gap-3">
                  <span className="text-orange mt-1 flex-none">—</span>
                  <div>
                    <span className="font-semibold text-espresso text-sm">{item.name}</span>
                    <p className="text-brown-muted text-sm mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="border-t border-brown-border" />

      {/* RECENT REVIEWS */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-brown-muted mb-1">Community</p>
          <h2 className="font-playfair text-3xl text-espresso">Recent reviews</h2>
        </div>
        <RecentReviews reviews={recentReviews} />
      </section>

      {/* SUBMIT STRIP */}
      <div className="border-t border-brown-border" />
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-playfair text-xl text-espresso">Know a hidden gem?</p>
          <p className="text-brown-muted text-sm mt-0.5">Submit a café that&apos;s not on our map yet.</p>
        </div>
        <Link
          href="/submit"
          className="text-orange font-semibold border border-orange px-6 py-2.5 rounded-full hover:bg-orange hover:text-white transition-all duration-200 flex-none text-sm"
        >
          Submit a café
        </Link>
      </section>

    </div>
  );
}
