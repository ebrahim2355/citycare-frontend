"use client";

import type { CircleMarker as LeafletCircleMarker, LatLngTuple } from "leaflet";
import { type ReactNode, type RefObject, useEffect, useRef } from "react";
import { CircleMarker, Popup, useMap } from "react-leaflet";
import { CityMap } from "@/components/map/city-map";
import { DHAKA_CENTER } from "@/lib/geo";
import { markerRadius, OVERDUE_RING, STATUS_COLOR } from "@/lib/map-style";
import type { ComplaintStatus } from "@/types";

export interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  status: ComplaintStatus;
  isOverdue: boolean;
  supportCount?: number;
}

export interface MapFocus {
  id: string;
  nonce: number;
}

interface ReportMapProps {
  points: MapPoint[];
  label: string;
  focus?: MapFocus | null;
  renderPopup: (id: string) => ReactNode;
  className?: string;
}

function FitToPoints({ pointsRef, pointsKey }: { pointsRef: RefObject<MapPoint[]>; pointsKey: string }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (!pointsKey) {
      return;
    }

    const bounds = pointsRef.current.map((point): LatLngTuple => [point.latitude, point.longitude]);

    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15, animate: fitted.current });
    fitted.current = true;
  }, [map, pointsKey, pointsRef]);

  return null;
}

function FlyToFocus({
  pointsRef,
  markersRef,
  focus,
}: {
  pointsRef: RefObject<MapPoint[]>;
  markersRef: RefObject<Map<string, LeafletCircleMarker>>;
  focus?: MapFocus | null;
}) {
  const map = useMap();
  const focusId = focus?.id;
  const nonce = focus?.nonce;

  useEffect(() => {
    const point = pointsRef.current.find((item) => item.id === focusId);

    if (!point || nonce === undefined) {
      return;
    }

    map.flyTo([point.latitude, point.longitude], Math.max(map.getZoom(), 16), { duration: 0.7 });
    map.once("moveend", () => markersRef.current.get(point.id)?.openPopup());
  }, [map, focusId, nonce, pointsRef, markersRef]);

  return null;
}

export default function ReportMap({ points, label, focus, renderPopup, className }: ReportMapProps) {
  const markersRef = useRef(new Map<string, LeafletCircleMarker>());
  const pointsRef = useRef(points);
  const pointsKey = points.map((point) => point.id).join(",");

  useEffect(() => {
    pointsRef.current = points;
  });

  return (
    <CityMap center={DHAKA_CENTER} zoom={12} label={label} className={className} scrollWheelZoom>
      <FitToPoints pointsRef={pointsRef} pointsKey={pointsKey} />
      <FlyToFocus pointsRef={pointsRef} markersRef={markersRef} focus={focus} />
      {points.map((point) => (
        <CircleMarker
          key={point.id}
          ref={(marker) => {
            if (marker) {
              markersRef.current.set(point.id, marker);
            } else {
              markersRef.current.delete(point.id);
            }
          }}
          center={[point.latitude, point.longitude]}
          radius={markerRadius(point.supportCount)}
          pathOptions={{
            color: point.isOverdue ? OVERDUE_RING : "#ffffff",
            weight: point.isOverdue ? 3 : 2,
            fillColor: STATUS_COLOR[point.status],
            fillOpacity: 0.92,
          }}
        >
          <Popup minWidth={240} maxWidth={280}>
            {renderPopup(point.id)}
          </Popup>
        </CircleMarker>
      ))}
    </CityMap>
  );
}
