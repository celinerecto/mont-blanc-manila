"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import StarRating from "@/components/ui/StarRating";
import VoteButton from "@/components/ui/VoteButton";
import AuthModal from "@/components/ui/AuthModal";
import { formatPrice } from "@/lib/utils";
import type { Item } from "@/types";

interface ItemCardProps {
  item: Item;
  rank?: number;
  showCafe?: boolean;
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export default function ItemCard({ item, rank, showCafe = true }: ItemCardProps) {
  const [showAuth, setShowAuth] = useState(false);
  const firstPhoto = item.photos?.[0];

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <div className="bg-cream-surface rounded-3xl border border-brown-border shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex flex-col">
        {/* Photo / placeholder */}
        <div className="relative h-44 bg-orange-pale flex items-center justify-center overflow-hidden">
          {firstPhoto ? (
            <Image
              src={firstPhoto.storage_url}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <span className="text-6xl opacity-40">☕</span>
          )}
          {rank !== undefined && rank < 3 && (
            <div className="absolute top-3 left-3 text-3xl drop-shadow-md">
              {RANK_MEDALS[rank]}
            </div>
          )}
          {rank !== undefined && rank >= 3 && (
            <div className="absolute top-3 left-3 bg-espresso/80 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {rank + 1}
            </div>
          )}
          {item.cafe && !item.cafe.is_verified && (
            <div className="absolute top-3 right-3">
              <Badge variant="unverified">🔍 Unverified</Badge>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1 gap-3">
          <div>
            <h3 className="font-playfair font-semibold text-espresso text-lg leading-tight">
              {item.name}
              {item.variant && <span className="text-brown-muted font-normal text-sm ml-1">· {item.variant}</span>}
            </h3>
            {showCafe && item.cafe && (
              <Link
                href={`/cafe/${item.cafe.id}`}
                className="text-orange hover:text-orange-hover text-sm font-medium transition-colors mt-0.5 inline-block"
              >
                {item.cafe.name}
              </Link>
            )}
          </div>

          {item.cafe && (
            <Badge variant="neighborhood">{item.cafe.neighborhood}</Badge>
          )}

          {item.description && (
            <p className="text-brown-muted text-xs leading-relaxed line-clamp-2">{item.description}</p>
          )}

          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex flex-col gap-1">
              {item.price !== undefined && item.price !== null && (
                <span className="text-xs text-brown-muted font-medium">{formatPrice(item.price)}</span>
              )}
              {item.avg_rating !== undefined && item.avg_rating !== null && item.avg_rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <StarRating rating={Math.round(item.avg_rating)} size="sm" />
                  <span className="text-xs text-brown-muted">{item.avg_rating.toFixed(1)}</span>
                </div>
              )}
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
    </>
  );
}
