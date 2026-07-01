import Link from "next/link";
import StarRating from "@/components/ui/StarRating";
import { formatDate, getInitials } from "@/lib/utils";
import type { Review } from "@/types";

interface RecentReviewsProps {
  reviews: Review[];
}

export default function RecentReviews({ reviews }: RecentReviewsProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-cream-surface rounded-3xl border border-brown-border">
        <div className="text-5xl mb-3">📝</div>
        <p className="font-playfair text-lg font-semibold text-espresso">No reviews yet</p>
        <p className="text-brown-muted text-sm mt-1">Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:-mx-0 sm:px-0 snap-x scroll-smooth">
      {reviews.map((review) => {
        const authorName =
          review.user?.user_metadata?.full_name ??
          review.user?.email?.split("@")[0] ??
          "Coffee Lover";
        return (
          <div
            key={review.id}
            className="flex-none w-72 snap-start bg-cream-surface rounded-3xl border border-brown-border shadow-md p-5 hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-orange-pale text-orange font-bold text-sm flex items-center justify-center flex-none">
                {getInitials(authorName)}
              </div>
              <div className="min-w-0">
                <p className="text-espresso font-semibold text-sm truncate">{authorName}</p>
                <p className="text-brown-muted text-xs">{formatDate(review.created_at)}</p>
              </div>
            </div>
            <StarRating rating={review.rating} size="sm" />
            <p className="text-brown text-sm mt-2 line-clamp-3 leading-relaxed">{review.body}</p>
            {review.item && (
              <div className="mt-3 pt-3 border-t border-brown-border">
                <p className="text-xs text-brown-muted">
                  <span className="font-medium text-brown">{review.item.name}</span>
                  {review.item.variant && ` · ${review.item.variant}`}
                </p>
                {review.item.cafe && (
                  <Link
                    href={`/cafe/${review.item.cafe.id}`}
                    className="text-xs text-orange hover:text-orange-hover transition-colors font-medium"
                  >
                    {review.item.cafe.name}
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
