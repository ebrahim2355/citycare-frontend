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

const toBoundsKey = (points: MapPoint[]) => points.map((point) => `${point.latitude},${point.longitude}`).join(";");

const fromBoundsKey = (key: string) =>
  key.split(";").map((pair): LatLngTuple => {
    const [latitude = 0, longitude = 0] = pair.split(",").map(Number);

    return [latitude, longitude];
  });

function FitToPoints({ boundsKey }: { boundsKey: string }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    const size = map.getSize();

    if (!boundsKey || !size.x || !size.y) {
      return;
    }

    map.fitBounds(fromBoundsKey(boundsKey), { padding: [48, 48], maxZoom: 15, animate: fitted.current });
    fitted.current = true;
  }, [map, boundsKey]);

  return null;
}

interface FocusTarget {
  id: string;
  latitude: number;
  longitude: number;
  nonce: number;
}

function FlyToFocus({ target, markersRef }: { target: FocusTarget | null; markersRef: RefObject<Map<string, LeafletCircleMarker>> }) {
  const map = useMap();
  const id = target?.id;
  const latitude = target?.latitude;
  const longitude = target?.longitude;
  const nonce = target?.nonce;

  useEffect(() => {
    if (id === undefined || latitude === undefined || longitude === undefined || nonce === undefined) {
      return;
    }

    map.flyTo([latitude, longitude], Math.max(map.getZoom(), 16), { duration: 0.7 });
    map.once("moveend", () => markersRef.current.get(id)?.openPopup());
  }, [map, id, latitude, longitude, nonce, markersRef]);

  return null;
}

export default function ReportMap({ points, label, focus, renderPopup, className }: ReportMapProps) {
  const markersRef = useRef(new Map<string, LeafletCircleMarker>());
  const focused = focus ? points.find((point) => point.id === focus.id) : undefined;
  const target = focus && focused ? { id: focused.id, latitude: focused.latitude, longitude: focused.longitude, nonce: focus.nonce } : null;

  return (
    <CityMap center={DHAKA_CENTER} zoom={12} label={label} className={className} scrollWheelZoom>
      <FitToPoints boundsKey={toBoundsKey(points)} />
      <FlyToFocus target={target} markersRef={markersRef} />
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
