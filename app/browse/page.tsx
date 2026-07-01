import { createClient } from "@/lib/supabase/server";
import BrowseClient from "./BrowseClient";

export const revalidate = 60;

export default async function BrowsePage() {
  const supabase = await createClient();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: rawItems } = await supabase
    .from("items")
    .select(`
      *,
      cafe:cafes(*),
      photos(id, storage_url),
      votes(id, created_at),
      reviews(rating)
    `);

  const items = (rawItems ?? []).map((item) => {
    const weeklyVotes = (item.votes as { id: string; created_at: string }[]).filter(
      (v) => v.created_at >= sevenDaysAgo
    ).length;
    const ratings = (item.reviews as { rating: number }[]).map((r) => r.rating);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    return { ...item, vote_count: weeklyVotes, avg_rating: avgRating };
  });

  const { data: cafes } = await supabase
    .from("cafes")
    .select("id, name, neighborhood, lat, lng, is_verified");

  const neighborhoods = [...new Set(items.map((i) => i.cafe?.neighborhood).filter(Boolean))] as string[];

  return (
    <BrowseClient
      initialItems={items as never}
      cafes={cafes ?? []}
      neighborhoods={neighborhoods}
    />
  );
}
