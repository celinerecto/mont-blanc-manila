"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import StarRating from "@/components/ui/StarRating";
import VoteButton from "@/components/ui/VoteButton";
import { formatPrice } from "@/lib/utils";
import type { Item } from "@/types";

interface ItemCardProps {
  item: Item;
  rank?: number;
  showCafe?: boolean;
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export default function ItemCard({ item, rank, showCafe = true }: ItemCardProps) {
  const firstPhoto = item.photos?.[0];

  return (
    <div className="bg-[#f5f5f3] rounded-2xl overflow-hidden hover:bg-[#eeede9] transition-all duration-200 group flex flex-col">
      {/* Photo */}
      <div className="relative h-48 flex items-center justify-center overflow-hidden rounded-2xl mx-3 mt-3">
        {firstPhoto ? (
          <Image
            src={firstPhoto.storage_url}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <span className="text-7xl opacity-20">☕</span>
        )}
        {rank !== undefined && rank < 3 && (
          <div className="absolute top-2 left-2 text-2xl drop-shadow">{RANK_MEDALS[rank]}</div>
        )}
        {rank !== undefined && rank >= 3 && (
          <div className="absolute top-2 left-2 bg-espresso/80 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
            {rank + 1}
          </div>
        )}
        {item.cafe && !item.cafe.is_verified && (
          <div className="absolute top-2 right-2 bg-white/90 text-brown-muted text-xs px-2 py-0.5 rounded-full">
            🔍 Unverified
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <h3 className="font-playfair font-semibold text-espresso text-base leading-snug">
            {item.name}
            {item.variant && <span className="text-brown-muted font-normal text-sm"> · {item.variant}</span>}
          </h3>
          {showCafe && item.cafe && (
            <Link
              href={`/cafe/${item.cafe.id}`}
              className="text-brown-muted text-xs hover:text-orange transition-colors mt-0.5 inline-block"
            >
              {item.cafe.name} · {item.cafe.neighborhood}
            </Link>
          )}
        </div>

        {item.description && (
          <p className="text-brown-muted text-xs leading-relaxed line-clamp-2">{item.description}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col gap-0.5">
            {item.price !== undefined && item.price !== null && (
              <span className="text-xs text-brown-muted">{formatPrice(item.price)}</span>
            )}
            {item.avg_rating !== undefined && item.avg_rating !== null && item.avg_rating > 0 && (
              <div className="flex items-center gap-1">
                <StarRating rating={Math.round(item.avg_rating)} size="sm" />
                <span className="text-xs text-brown-muted">{item.avg_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <VoteButton
            itemId={item.id}
            initialCount={item.vote_count ?? 0}
            initialVoted={item.user_has_voted ?? false}
          />
        </div>
      </div>
    </div>
  );
}
