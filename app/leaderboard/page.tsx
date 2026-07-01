import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";
import LeaderboardClient from "./LeaderboardClient";

export const revalidate = 30;

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: rawItems } = await supabase
    .from("items")
    .select(`
      *,
      cafe:cafes(id, name, neighborhood, is_verified),
      votes(id, created_at),
      reviews(id, rating),
      photos(id, storage_url)
    `);

  const items = (rawItems ?? []).map((item) => {
    const weeklyVotes = (item.votes as { id: string; created_at: string }[]).filter(
      (v) => v.created_at >= sevenDaysAgo
    ).length;
    const allVotes = (item.votes as { id: string }[]).length;
    const ratings = (item.reviews as { rating: number }[]).map((r) => r.rating);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    return { ...item, vote_count: weeklyVotes, lifetime_votes: allVotes, avg_rating: avgRating, review_count: ratings.length };
  }).sort((a, b) => b.vote_count - a.vote_count);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="font-playfair text-5xl font-black text-espresso mb-3">Weekly Leaderboard</h1>
        <p className="text-brown-muted max-w-md mx-auto">
          Votes reset every Sunday. The café with the most votes this week earns the top spot.
          <br />Cast your vote now!
        </p>
      </div>

      <LeaderboardClient items={items as never} />
    </div>
  );
}
