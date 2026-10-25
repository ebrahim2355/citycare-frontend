import { AREA_CENTERS } from "@/lib/areas";

export type LatLng = [number, number];

export const DHAKA_CENTER: LatLng = [23.7808, 90.4093];

const EARTH_RADIUS_METERS = 6371000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const distanceMeters = ([lat1, lng1]: LatLng, [lat2, lng2]: LatLng) => {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
};

export const nearestArea = (point: LatLng, maxMeters = 3000) => {
  let best: { name: string; meters: number } | null = null;

  for (const [name, center] of Object.entries(AREA_CENTERS)) {
    const meters = distanceMeters(point, center);

    if (meters <= maxMeters && (!best || meters < best.meters)) {
      best = { name, meters };
    }
  }

  return best?.name ?? null;
};

export const roundCoordinate = (value: number) => Number(value.toFixed(6));

export const formatDistance = (meters: number) => {
  if (meters < 1000) {
    return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
};
