"use client";

import type { LeafletEventHandlerFnMap } from "leaflet";
import { useEffect, useMemo } from "react";
import { Marker, useMap, useMapEvents } from "react-leaflet";
import { CityMap, pinIcon } from "@/components/map/city-map";
import { type LatLng, roundCoordinate } from "@/lib/geo";

export interface PickedLocation {
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  value: PickedLocation | null;
  fallbackCenter: LatLng;
  onChange: (location: PickedLocation) => void;
}

const toLocation = ({ lat, lng }: { lat: number; lng: number }): PickedLocation => ({
  latitude: roundCoordinate(lat),
  longitude: roundCoordinate(lng),
});

function PickOnClick({ onPick }: { onPick: (location: PickedLocation) => void }) {
  useMapEvents({ click: (event) => onPick(toLocation(event.latlng)) });

  return null;
}

function KeepInView({ position, fallbackCenter }: { position: LatLng | null; fallbackCenter: LatLng }) {
  const map = useMap();
  const [latitude, longitude] = position ?? [];
  const [fallbackLatitude, fallbackLongitude] = fallbackCenter;

  useEffect(() => {
    if (latitude === undefined || longitude === undefined) {
      return;
    }

    if (!map.getBounds().contains([latitude, longitude])) {
      map.flyTo([latitude, longitude], Math.max(map.getZoom(), 16), { duration: 0.6 });
    }
  }, [map, latitude, longitude]);

  useEffect(() => {
    if (latitude === undefined) {
      map.flyTo([fallbackLatitude, fallbackLongitude], 14, { duration: 0.6 });
    }
  }, [map, latitude, fallbackLatitude, fallbackLongitude]);

  return null;
}

export default function LocationPicker({ value, fallbackCenter, onChange }: LocationPickerProps) {
  const icon = useMemo(() => pinIcon(), []);
  const position: LatLng | null = value ? [value.latitude, value.longitude] : null;
  const handlers = useMemo<LeafletEventHandlerFnMap>(
    () => ({ dragend: (event) => onChange(toLocation(event.target.getLatLng())) }),
    [onChange]
  );

  return (
    <CityMap
      center={position ?? fallbackCenter}
      zoom={position ? 16 : 13}
      label="Map. Click or tap to drop a pin on the exact spot"
      className="h-72 [&_.leaflet-container]:cursor-crosshair"
    >
      <PickOnClick onPick={onChange} />
      <KeepInView position={position} fallbackCenter={fallbackCenter} />
      {position && <Marker position={position} icon={icon} draggable eventHandlers={handlers} title="Exact spot. Drag to adjust" />}
    </CityMap>
  );
}
