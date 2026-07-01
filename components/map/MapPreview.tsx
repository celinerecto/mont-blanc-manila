"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full skeleton flex items-center justify-center">
      <span className="text-4xl opacity-40">🗺️</span>
    </div>
  ),
});

interface Cafe {
  id: string;
  name: string;
  neighborhood: string;
  lat: number;
  lng: number;
  is_verified: boolean;
}

export default function MapPreview({ cafes }: { cafes: Cafe[] }) {
  return <LeafletMap cafes={cafes} preview />;
}
