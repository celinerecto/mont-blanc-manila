"use client";

import { useState } from "react";
import Image from "next/image";

interface Photo { storage_url: string }
interface CafeItem { id: string; name: string; variant?: string; price?: number; description?: string; photos?: Photo[] }
interface PendingCafe {
  id: string; name: string; address: string; neighborhood: string;
  website?: string; hours?: string; submitted_by?: string; created_at: string;
  items?: CafeItem[];
}
interface PendingReview {
  id: string; body: string; rating: number; reviewer_name?: string; created_at: string;
  item?: { name: string; cafe?: { name: string; neighborhood: string } };
}

interface Props {
  pendingCafes: PendingCafe[];
  pendingReviews: PendingReview[];
}

type Status = "pending" | "approved" | "rejected";

export default function AdminDashboard({ pendingCafes, pendingReviews }: Props) {
  const [cafeStatuses, setCafeStatuses] = useState<Record<string, Status>>({});
  const [reviewStatuses, setReviewStatuses] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const moderate = async (table: "cafes" | "reviews", id: string, action: "approved" | "rejected") => {
    setLoading(`${table}-${id}`);
    const res = await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, id, action }),
    });
    setLoading(null);
    if (res.ok) {
      if (table === "cafes") setCafeStatuses((s) => ({ ...s, [id]: action }));
      else setReviewStatuses((s) => ({ ...s, [id]: action }));
    }
  };

  const pendingCafeCount = pendingCafes.filter((c) => !cafeStatuses[c.id]).length;
  const pendingReviewCount = pendingReviews.filter((r) => !reviewStatuses[r.id]).length;

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="bg-espresso text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-playfair text-lg">Admin Dashboard</p>
          <p className="text-white/50 text-xs">Mont Blancs of Manila</p>
        </div>
        <div className="flex gap-4 text-sm text-white/70">
          <span>{pendingCafeCount} café{pendingCafeCount !== 1 ? "s" : ""} pending</span>
          <span>·</span>
          <span>{pendingReviewCount} review{pendingReviewCount !== 1 ? "s" : ""} pending</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        {/* CAFÉ SUBMISSIONS */}
        <section>
          <h2 className="font-playfair text-2xl text-espresso mb-5">Café Submissions</h2>

          {pendingCafes.length === 0 ? (
            <p className="text-brown-muted text-sm">No pending café submissions.</p>
          ) : (
            <div className="space-y-4">
              {pendingCafes.map((cafe) => {
                const status = cafeStatuses[cafe.id];
                const item = cafe.items?.[0];
                const photo = item?.photos?.[0];
                return (
                  <div key={cafe.id} className={`bg-white rounded-2xl border p-5 transition-all ${
                    status === "approved" ? "border-green-200 opacity-60" :
                    status === "rejected" ? "border-red-200 opacity-40" :
                    "border-brown-border"
                  }`}>
                    <div className="flex gap-4">
                      {photo && (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-none">
                          <Image src={photo.storage_url} alt={cafe.name} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-playfair text-lg text-espresso">{cafe.name}</p>
                            <p className="text-brown-muted text-xs mt-0.5">{cafe.address} · {cafe.neighborhood}</p>
                            {cafe.website && <p className="text-xs text-orange mt-0.5">{cafe.website}</p>}
                            {cafe.hours && <p className="text-xs text-brown-muted mt-0.5">Hours: {cafe.hours}</p>}
                          </div>
                          <p className="text-xs text-brown-muted flex-none">{new Date(cafe.created_at).toLocaleDateString("en-PH")}</p>
                        </div>
                        {item && (
                          <div className="mt-3 bg-[#f5f5f3] rounded-xl px-3 py-2 text-xs text-brown space-y-0.5">
                            <p><span className="text-brown-muted">Item:</span> {item.name}{item.variant ? ` · ${item.variant}` : ""}{item.price ? ` · ₱${item.price}` : ""}</p>
                            {item.description && <p><span className="text-brown-muted">Notes:</span> {item.description}</p>}
                          </div>
                        )}
                      </div>
                    </div>

                    {!status ? (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => moderate("cafes", cafe.id, "approved")}
                          disabled={loading === `cafes-${cafe.id}`}
                          className="px-4 py-2 bg-espresso text-white text-xs rounded-lg hover:bg-brown transition-colors disabled:opacity-50"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => moderate("cafes", cafe.id, "rejected")}
                          disabled={loading === `cafes-${cafe.id}`}
                          className="px-4 py-2 border border-red-300 text-red-600 text-xs rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    ) : (
                      <p className={`mt-3 text-xs font-semibold ${status === "approved" ? "text-green-600" : "text-red-500"}`}>
                        {status === "approved" ? "✓ Approved" : "✕ Rejected"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* REVIEWS */}
        <section>
          <h2 className="font-playfair text-2xl text-espresso mb-5">Review Submissions</h2>

          {pendingReviews.length === 0 ? (
            <p className="text-brown-muted text-sm">No pending reviews.</p>
          ) : (
            <div className="space-y-3">
              {pendingReviews.map((review) => {
                const status = reviewStatuses[review.id];
                return (
                  <div key={review.id} className={`bg-white rounded-2xl border p-5 transition-all ${
                    status === "approved" ? "border-green-200 opacity-60" :
                    status === "rejected" ? "border-red-200 opacity-40" :
                    "border-brown-border"
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-brown-muted">
                          {review.item?.cafe?.name} · {review.item?.name}
                          {review.reviewer_name && <> · <span className="text-espresso">{review.reviewer_name}</span></>}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </div>
                        <p className="text-sm text-brown mt-2 leading-relaxed">{review.body}</p>
                      </div>
                      <p className="text-xs text-brown-muted flex-none">{new Date(review.created_at).toLocaleDateString("en-PH")}</p>
                    </div>

                    {!status ? (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => moderate("reviews", review.id, "approved")}
                          disabled={loading === `reviews-${review.id}`}
                          className="px-4 py-2 bg-espresso text-white text-xs rounded-lg hover:bg-brown transition-colors disabled:opacity-50"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => moderate("reviews", review.id, "rejected")}
                          disabled={loading === `reviews-${review.id}`}
                          className="px-4 py-2 border border-red-300 text-red-600 text-xs rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    ) : (
                      <p className={`mt-3 text-xs font-semibold ${status === "approved" ? "text-green-600" : "text-red-500"}`}>
                        {status === "approved" ? "✓ Approved" : "✕ Rejected"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
