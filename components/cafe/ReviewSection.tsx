"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAnonId } from "@/lib/anonId";
import StarRating from "@/components/ui/StarRating";
import { formatDate, getInitials } from "@/lib/utils";
import type { Review, Item } from "@/types";

interface ReviewSectionProps {
  itemId?: string;
  cafeId: string;
  initialReviews: Review[];
  items: Item[];
}

export default function ReviewSection({ initialReviews, items }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(items[0]?.id ?? "");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) { setError("Please write a review."); return; }

    setSubmitting(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? getAnonId();

    const { data, error: err } = await supabase
      .from("reviews")
      .insert({ item_id: selectedItem, user_id: userId, body, rating })
      .select("*, item:items(name, variant)")
      .single();

    setSubmitting(false);
    if (err) {
      setError(err.message.includes("unique") ? "You've already reviewed this item." : err.message);
    } else {
      setReviews([data as unknown as Review, ...reviews]);
      setBody("");
      setRating(5);
      setAuthorName("");
      setShowForm(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-playfair text-2xl font-semibold text-espresso">
          Reviews ({reviews.length})
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-orange-hover transition-all hover:scale-105"
          >
            Write a Review
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-cream-surface rounded-3xl border border-brown-border shadow-md p-6 mb-8 space-y-4">
          <h3 className="font-playfair text-xl font-semibold text-espresso">Share your thoughts ☕</h3>

          <div>
            <label className="block text-sm font-medium text-brown mb-1">Your Name (optional)</label>
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Maria"
              className="w-full bg-cream border border-brown-border rounded-xl px-4 py-2.5 text-sm text-brown placeholder-brown-muted focus:outline-none focus:border-orange"
            />
          </div>

          {items.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Which item?</label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="bg-cream border border-brown-border rounded-xl px-3 py-2 text-sm text-brown focus:outline-none focus:border-orange w-full"
              >
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}{i.variant ? ` · ${i.variant}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-brown mb-1">Your Rating</label>
            <StarRating rating={rating} size="lg" interactive onChange={setRating} />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown mb-1">Your Review</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="How was the Mont Blanc? Describe the flavour, texture, presentation..."
              className="w-full bg-cream border border-brown-border rounded-2xl px-4 py-3 text-sm text-brown placeholder-brown-muted focus:outline-none focus:border-orange resize-none"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-orange text-white font-semibold px-6 py-2.5 rounded-full hover:bg-orange-hover transition-all disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-brown-muted text-sm hover:text-brown transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-cream-surface rounded-3xl border border-brown-border">
          <div className="text-5xl mb-3">📝</div>
          <p className="font-playfair text-lg font-semibold text-espresso">No reviews yet!</p>
          <p className="text-brown-muted text-sm mt-1">Be the first to review this café's Mont Blanc. ☕</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const name = (review.user?.user_metadata?.full_name ?? review.user?.email?.split("@")[0] ?? "Coffee Lover");
            return (
              <div key={review.id} className="bg-cream-surface rounded-3xl border border-brown-border p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-pale text-orange font-bold text-sm flex items-center justify-center flex-none">
                    {getInitials(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <p className="font-semibold text-espresso text-sm">{name}</p>
                      <span className="text-xs text-brown-muted">{formatDate(review.created_at)}</span>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                    <p className="text-brown text-sm mt-2 leading-relaxed">{review.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
