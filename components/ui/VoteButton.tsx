"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface VoteButtonProps {
  itemId: string;
  initialCount: number;
  initialVoted: boolean;
  onAuthRequired?: () => void;
}

export default function VoteButton({
  itemId,
  initialCount,
  initialVoted,
  onAuthRequired,
}: VoteButtonProps) {
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const supabase = createClient();

  const handleVote = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      onAuthRequired?.();
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (voted) {
        // Remove vote
        const now = new Date();
        const week = getWeekNumber(now);
        await supabase
          .from("votes")
          .delete()
          .eq("item_id", itemId)
          .eq("user_id", user.id)
          .eq("week_number", week)
          .eq("year", now.getFullYear());
        setVoted(false);
        setCount((c) => Math.max(0, c - 1));
      } else {
        // Add vote
        const now = new Date();
        const week = getWeekNumber(now);
        const { error } = await supabase.from("votes").insert({
          item_id: itemId,
          user_id: user.id,
          week_number: week,
          year: now.getFullYear(),
        });
        if (!error) {
          setVoted(true);
          setCount((c) => c + 1);
          setAnimating(true);
          setTimeout(() => setAnimating(false), 600);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [voted, loading, itemId, supabase, onAuthRequired]);

  return (
    <button
      onClick={handleVote}
      disabled={loading}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200",
        voted
          ? "bg-orange text-white shadow-md hover:bg-orange-hover"
          : "bg-orange-pale text-orange border border-orange/30 hover:bg-orange hover:text-white hover:border-orange",
        animating && "vote-pulse animate-vote-bounce",
        loading && "opacity-60 cursor-not-allowed"
      )}
      aria-label={voted ? "Remove vote" : "Vote for this Mont Blanc"}
    >
      <span className={cn("text-base transition-transform", animating && "scale-125")}>
        {voted ? "☕" : "☕"}
      </span>
      <span>{count}</span>
    </button>
  );
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
