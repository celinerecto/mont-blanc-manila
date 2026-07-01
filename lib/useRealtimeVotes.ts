"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeVotes(
  itemIds: string[],
  onUpdate: (itemId: string, delta: number) => void
) {
  useEffect(() => {
    if (!itemIds.length) return;

    const supabase = createClient();
    const channel = supabase
      .channel("votes-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `item_id=in.(${itemIds.join(",")})`,
        },
        (payload) => {
          onUpdate(payload.new.item_id as string, 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "votes",
          filter: `item_id=in.(${itemIds.join(",")})`,
        },
        (payload) => {
          onUpdate(payload.old.item_id as string, -1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemIds.join(",")]);
}
