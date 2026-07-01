"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

// Custom orange marker
const createIcon = (verified: boolean) =>
  L.divIcon({
    html: `<div style="
      width:32px;height:32px;border-radius:50% 50% 50% 0;
      background:${verified ? "#E8621A" : "#C4873A"};
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);font-size:14px;display:block;text-align:center;line-height:26px;">☕</span></div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

interface Cafe {
  id: string;
  name: string;
  neighborhood: string;
  lat: number;
  lng: number;
  is_verified: boolean;
}

interface LeafletMapProps {
  cafes: Cafe[];
  preview?: boolean;
}

// Manila center coords
const MANILA_CENTER: [number, number] = [14.5765, 121.0]

export default function LeafletMap({ cafes, preview = false }: LeafletMapProps) {
  useEffect(() => {
    // Fix default marker icons
    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer
      center={MANILA_CENTER}
      zoom={preview ? 11 : 12}
      style={{ height: "100%", width: "100%" }}
      zoomControl={!preview}
      scrollWheelZoom={!preview}
      dragging={!preview}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {cafes.map((cafe) => (
        <Marker
          key={cafe.id}
          position={[cafe.lat, cafe.lng]}
          icon={createIcon(cafe.is_verified)}
        >
          <Popup>
            <div className="text-espresso">
              <p className="font-semibold text-sm">{cafe.name}</p>
              <p className="text-xs text-brown-muted">{cafe.neighborhood}</p>
              {!preview && (
                <Link href={`/cafe/${cafe.id}`} className="text-orange text-xs font-medium hover:underline">
                  View café →
                </Link>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
