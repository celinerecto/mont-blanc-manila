"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import ItemCard from "@/components/cafe/ItemCard";
import type { Item } from "@/types";

const MapPreview = dynamic(() => import("@/components/map/MapPreview"), { ssr: false });

interface BrowseSectionProps {
  items: Item[];
  cafes: { id: string; name: string; neighborhood: string; lat: number; lng: number; is_verified: boolean }[];
}

export default function BrowseSection({ items, cafes }: BrowseSectionProps) {
  const [activeNeighborhood, setActiveNeighborhood] = useState<string>("All");
  const [view, setView] = useState<"grid" | "map">("grid");

  const neighborhoods = useMemo(() => {
    const all = items.map((i) => i.cafe?.neighborhood).filter(Boolean) as string[];
    return ["All", ...Array.from(new Set(all)).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    if (activeNeighborhood === "All") return items;
    return items.filter((i) => i.cafe?.neighborhood === activeNeighborhood);
  }, [items, activeNeighborhood]);

  const filteredCafes = useMemo(() => {
    if (activeNeighborhood === "All") return cafes;
    return cafes.filter((c) => c.neighborhood === activeNeighborhood);
  }, [cafes, activeNeighborhood]);

  return (
    <div>
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-6">
        {/* Neighborhood chips */}
        <div className="flex flex-wrap gap-2">
          {neighborhoods.map((n) => (
            <button
              key={n}
              onClick={() => setActiveNeighborhood(n)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 border
                ${activeNeighborhood === n
                  ? "bg-espresso text-white border-espresso"
                  : "bg-white text-brown border-brown-border hover:border-espresso hover:text-espresso"
                }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Grid / Map toggle */}
        <div className="flex items-center gap-1 flex-none border border-brown-border rounded-lg p-0.5 w-fit">
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              view === "grid" ? "bg-espresso text-white" : "text-brown hover:text-espresso"
            }`}
          >
            ▦ Grid
          </button>
          <button
            onClick={() => setView("map")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              view === "map" ? "bg-espresso text-white" : "text-brown hover:text-espresso"
            }`}
          >
            ⊙ Map
          </button>
        </div>
      </div>

      {/* Content */}
      {view === "grid" ? (
        filtered.length === 0 ? (
          <div className="text-center py-16 bg-[#f5f5f3] rounded-2xl">
            <div className="text-4xl mb-3">☕</div>
            <p className="text-brown-muted text-sm">No entries in {activeNeighborhood} yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, idx) => (
              <ItemCard key={item.id} item={item} rank={idx} showCafe />
            ))}
          </div>
        )
      ) : (
        <div className="h-[480px] rounded-2xl overflow-hidden border border-brown-border">
          <MapPreview cafes={filteredCafes} />
        </div>
      )}
    </div>
  );
}
