"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";
import VoteButton from "@/components/ui/VoteButton";
import AuthModal from "@/components/ui/AuthModal";
import EmptyState from "@/components/ui/EmptyState";
import type { Item } from "@/types";

const MEDALS = ["🥇", "🥈", "🥉"];

interface LeaderboardItem extends Item {
  lifetime_votes?: number;
  review_count?: number;
}

export default function LeaderboardClient({ items }: { items: LeaderboardItem[] }) {
  const [showAuth, setShowAuth] = useState(false);

  if (items.length === 0) {
    return (
      <EmptyState
        emoji="☕"
        title="No votes yet this week!"
        description="Be the first to vote and crown this week's champion."
        action={
          <Link href="/browse" className="bg-orange text-white font-semibold px-6 py-3 rounded-full hover:bg-orange-hover transition-all inline-block">
            Browse Cafés
          </Link>
        }
      />
    );
  }

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Top 3 hero cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {items.slice(0, 3).map((item, idx) => {
          const photo = item.photos?.[0];
          return (
            <div
              key={item.id}
              className={`relative bg-cream-surface rounded-3xl border shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-[1.02] ${
                idx === 0 ? "border-orange sm:scale-[1.03] sm:shadow-xl" : "border-brown-border"
              }`}
            >
              {/* Photo */}
              <div className="relative h-52 bg-orange-pale flex items-center justify-center">
                {photo ? (
                  <Image src={photo.storage_url} alt={item.name} fill className="object-cover" sizes="400px" />
                ) : (
                  <span className="text-7xl opacity-30">☕</span>
                )}
                <div className="absolute top-4 left-4 text-4xl drop-shadow-lg">{MEDALS[idx]}</div>
                {idx === 0 && (
                  <div className="absolute inset-0 bg-gradient-to-t from-orange/20 to-transparent" />
                )}
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-playfair text-5xl font-black text-espresso/10 leading-none -mb-2">
                      {idx + 1}
                    </p>
                    <h3 className="font-playfair text-lg font-semibold text-espresso">
                      {item.name}
                      {item.variant && <span className="text-brown-muted font-normal text-sm ml-1">· {item.variant}</span>}
                    </h3>
                  </div>
                </div>

                {item.cafe && (
                  <>
                    <Link href={`/cafe/${item.cafe.id}`} className="text-orange text-sm font-medium hover:text-orange-hover transition-colors">
                      {item.cafe.name}
                    </Link>
                    <Badge variant="neighborhood">{item.cafe.neighborhood}</Badge>
                  </>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div>
                    {item.avg_rating !== undefined && item.avg_rating > 0 && (
                      <div className="flex items-center gap-1">
                        <StarRating rating={Math.round(item.avg_rating)} size="sm" />
                        <span className="text-xs text-brown-muted">{item.avg_rating.toFixed(1)}</span>
                      </div>
                    )}
                    <p className="text-xs text-brown-muted mt-0.5">
                      {item.vote_count} vote{item.vote_count !== 1 ? "s" : ""} this week
                    </p>
                  </div>
                  <VoteButton
                    itemId={item.id}
                    initialCount={item.vote_count ?? 0}
                    initialVoted={item.user_has_voted ?? false}
                    onAuthRequired={() => setShowAuth(true)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full table */}
      {items.length > 3 && (
        <div className="bg-cream-surface rounded-3xl border border-brown-border shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-brown-border">
            <h2 className="font-playfair text-xl font-semibold text-espresso">Full Rankings</h2>
          </div>
          <div className="divide-y divide-brown-border">
            {items.slice(3).map((item, idx) => {
              const rank = idx + 4;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-orange-pale/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-pale text-brown-muted font-bold text-lg flex items-center justify-center flex-none">
                    {rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-espresso text-sm">
                      {item.name}
                      {item.variant && <span className="text-brown-muted font-normal"> · {item.variant}</span>}
                    </p>
                    {item.cafe && (
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Link href={`/cafe/${item.cafe.id}`} className="text-orange text-xs font-medium hover:text-orange-hover transition-colors">
                          {item.cafe.name}
                        </Link>
                        <Badge variant="neighborhood">{item.cafe.neighborhood}</Badge>
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1 flex-none">
                    {item.avg_rating !== undefined && item.avg_rating > 0 && (
                      <div className="flex items-center gap-1">
                        <StarRating rating={Math.round(item.avg_rating)} size="sm" />
                        <span className="text-xs text-brown-muted">{item.avg_rating.toFixed(1)}</span>
                      </div>
                    )}
                    <p className="text-xs text-brown-muted">{item.review_count ?? 0} reviews</p>
                  </div>
                  <div className="flex-none">
                    <VoteButton
                      itemId={item.id}
                      initialCount={item.vote_count ?? 0}
                      initialVoted={item.user_has_voted ?? false}
                      onAuthRequired={() => setShowAuth(true)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
