"use client";

import "leaflet/dist/leaflet.css";
import "./city-map.css";
import L from "leaflet";
import { type ReactNode, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { LatLng } from "@/lib/geo";
import { cn } from "@/lib/utils";

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

interface CityMapProps {
  center: LatLng;
  zoom: number;
  label: string;
  className?: string;
  children?: ReactNode;
  scrollWheelZoom?: boolean;
}

function FollowSize() {
  const map = useMap();

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());

    observer.observe(map.getContainer());

    return () => observer.disconnect();
  }, [map]);

  return null;
}

export function CityMap({ center, zoom, label, className, children, scrollWheelZoom = false }: CityMapProps) {
  return (
    <div role="region" aria-label={label} className={cn("isolate overflow-hidden rounded-xl border", className)}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={scrollWheelZoom} className="size-full" zoomControl>
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} maxZoom={19} />
        <FollowSize />
        {children}
      </MapContainer>
    </div>
  );
}

const pinSvg = (color: string) =>
  `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15 38.5s12-12.2 12-23C27 8 21.6 2 15 2S3 8 3 15.5c0 10.8 12 23 12 23z" fill="${color}" stroke="white" stroke-width="2.5"/><circle cx="15" cy="15.5" r="5" fill="white"/></svg>`;

export const pinIcon = (color = "var(--primary)") =>
  L.divIcon({
    className: "citycare-pin",
    html: pinSvg(color),
    iconSize: [30, 40],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });
