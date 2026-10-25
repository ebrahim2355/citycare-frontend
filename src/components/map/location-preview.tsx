"use client";

import { useMemo } from "react";
import { Marker } from "react-leaflet";
import { CityMap, pinIcon } from "@/components/map/city-map";
import { cn } from "@/lib/utils";

interface LocationPreviewProps {
  latitude: number;
  longitude: number;
  label: string;
  className?: string;
}

export default function LocationPreview({ latitude, longitude, label, className }: LocationPreviewProps) {
  const icon = useMemo(() => pinIcon(), []);

  return (
    <CityMap center={[latitude, longitude]} zoom={16} label={label} className={cn("h-56", className)}>
      <Marker position={[latitude, longitude]} icon={icon} title={label} />
    </CityMap>
  );
}
