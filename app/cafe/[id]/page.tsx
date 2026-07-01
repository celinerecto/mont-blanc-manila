import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import ItemCard from "@/components/cafe/ItemCard";
import ReviewSection from "@/components/cafe/ReviewSection";
import { formatDate } from "@/lib/utils";
import type { Item, Review } from "@/types";

export const revalidate = 30;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CafeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: cafe } = await supabase
    .from("cafes")
    .select("*, photos(id, storage_url, item_id)")
    .eq("id", id)
    .single();

  if (!cafe) notFound();

  const { data: rawItems } = await supabase
    .from("items")
    .select("*, photos(id, storage_url), votes(id, created_at), reviews(id, rating)")
    .eq("cafe_id", id);

  const items: Item[] = (rawItems ?? []).map((item) => {
    const weeklyVotes = (item.votes as { id: string; created_at: string }[]).filter(
      (v) => v.created_at >= sevenDaysAgo
    ).length;
    const ratings = (item.reviews as { rating: number }[]).map((r) => r.rating);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    return { ...item, cafe, vote_count: weeklyVotes, avg_rating: avgRating };
  });

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, item:items(name, variant)")
    .in("item_id", items.map((i) => i.id))
    .order("created_at", { ascending: false });

  const allPhotos = [
    ...(cafe.photos ?? []),
    ...items.flatMap((i) => i.photos ?? []),
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-brown-muted mb-6 flex items-center gap-2">
        <Link href="/browse" className="hover:text-orange transition-colors">Browse</Link>
        <span>›</span>
        <span className="text-brown">{cafe.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="neighborhood">{cafe.neighborhood}</Badge>
            {!cafe.is_verified && <Badge variant="unverified">🔍 Unverified</Badge>}
          </div>
          <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-espresso">{cafe.name}</h1>
          <p className="text-brown-muted mt-2">{cafe.address}</p>
          {cafe.hours && (
            <p className="text-sm text-brown mt-1">
              <span className="text-brown-muted">Hours: </span>{cafe.hours}
            </p>
          )}
          {cafe.website && (
            <a
              href={cafe.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange hover:text-orange-hover text-sm font-medium transition-colors mt-1 inline-block"
            >
              {cafe.website.replace(/^https?:\/\//, "")} ↗
            </a>
          )}
        </div>
      </div>

      {/* Photo gallery */}
      {allPhotos.length > 0 && (
        <section className="mb-10">
          <h2 className="font-playfair text-2xl font-semibold text-espresso mb-4">Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {allPhotos.slice(0, 8).map((photo) => (
              <div key={photo.id} className="aspect-square rounded-2xl overflow-hidden border border-brown-border bg-orange-pale">
                <Image
                  src={photo.storage_url}
                  alt="Mont Blanc photo"
                  width={400}
                  height={400}
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Items */}
      <section className="mb-10">
        <h2 className="font-playfair text-2xl font-semibold text-espresso mb-4">Mont Blanc Menu</h2>
        {items.length === 0 ? (
          <div className="text-center py-10 bg-cream-surface rounded-3xl border border-brown-border">
            <span className="text-4xl">☕</span>
            <p className="text-brown-muted mt-2 text-sm">No items listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <ItemCard key={item.id} item={item} rank={idx} showCafe={false} />
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <ReviewSection
        itemId={items[0]?.id}
        cafeId={cafe.id}
        initialReviews={(reviews ?? []) as unknown as Review[]}
        items={items}
      />
    </div>
  );
}
