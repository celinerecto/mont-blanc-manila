"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import ItemCard from "@/components/cafe/ItemCard";
import EmptyState from "@/components/ui/EmptyState";
import type { Item } from "@/types";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => <div className="h-full skeleton" />,
});

interface Cafe {
  id: string;
  name: string;
  neighborhood: string;
  lat: number;
  lng: number;
  is_verified: boolean;
}

type SortKey = "votes" | "rating" | "newest";

interface BrowseClientProps {
  initialItems: Item[];
  cafes: Cafe[];
  neighborhoods: string[];
}

export default function BrowseClient({ initialItems, cafes, neighborhoods }: BrowseClientProps) {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("votes");
  const [view, setView] = useState<"grid" | "map">("grid");

  const filtered = useMemo(() => {
    let result = initialItems;
    if (selectedNeighborhood) {
      result = result.filter((i) => i.cafe?.neighborhood === selectedNeighborhood);
    }
    return [...result].sort((a, b) => {
      if (sortBy === "votes") return (b.vote_count ?? 0) - (a.vote_count ?? 0);
      if (sortBy === "rating") return (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [initialItems, selectedNeighborhood, sortBy]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-playfair text-4xl font-bold text-espresso mb-2">Browse Mont Blancs ☕</h1>
        <p className="text-brown-muted">Discover {initialItems.length} Mont Blanc offerings across Manila</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Neighborhood pills */}
        <div className="flex flex-wrap gap-2 flex-1">
          <button
            onClick={() => setSelectedNeighborhood(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              !selectedNeighborhood
                ? "bg-orange text-white shadow-md"
                : "bg-orange-pale text-orange hover:bg-orange hover:text-white"
            }`}
          >
            All Areas
          </button>
          {neighborhoods.map((n) => (
            <button
              key={n}
              onClick={() => setSelectedNeighborhood(n === selectedNeighborhood ? null : n)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                selectedNeighborhood === n
                  ? "bg-orange text-white shadow-md"
                  : "bg-orange-pale text-orange hover:bg-orange hover:text-white"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Sort + view toggle */}
        <div className="flex items-center gap-3 flex-none">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="bg-cream-surface border border-brown-border text-brown text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-orange"
          >
            <option value="votes">Most Voted</option>
            <option value="rating">Top Rated</option>
            <option value="newest">Newest</option>
          </select>
          <div className="flex rounded-xl overflow-hidden border border-brown-border">
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === "grid" ? "bg-orange text-white" : "bg-cream-surface text-brown"}`}
            >
              ⊞ Grid
            </button>
            <button
              onClick={() => setView("map")}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === "map" ? "bg-orange text-white" : "bg-cream-surface text-brown"}`}
            >
              🗺 Map
            </button>
          </div>
        </div>
      </div>

      {/* Map View */}
      {view === "map" && (
        <div className="h-[500px] rounded-3xl overflow-hidden border border-brown-border shadow-md mb-8">
          <LeafletMap cafes={cafes.filter((c) => !selectedNeighborhood || c.neighborhood === selectedNeighborhood)} />
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="No results found"
          description="Try a different neighbourhood or clear your filters."
          action={
            <button
              onClick={() => setSelectedNeighborhood(null)}
              className="bg-orange text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-orange-hover transition-all"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, idx) => (
            <ItemCard key={item.id} item={item} rank={idx} showCafe />
          ))}
        </div>
      )}
    </div>
  );
}
