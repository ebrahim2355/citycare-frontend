import type { LatLng } from "@/lib/geo";

export const AREA_CENTERS: Record<string, LatLng> = {
  Badda: [23.7806, 90.4253],
  Banani: [23.7937, 90.4066],
  Bashundhara: [23.8155, 90.433],
  Dhanmondi: [23.7461, 90.3742],
  Farmgate: [23.7577, 90.3896],
  Gulshan: [23.7925, 90.414],
  Jatrabari: [23.7104, 90.4347],
  Khilgaon: [23.7518, 90.425],
  Lalbagh: [23.7189, 90.3882],
  Malibagh: [23.7499, 90.4127],
  Mirpur: [23.8069, 90.3687],
  Mohammadpur: [23.7662, 90.3589],
  Motijheel: [23.733, 90.4172],
  Rampura: [23.7612, 90.421],
  Shyamoli: [23.7745, 90.3657],
  Tejgaon: [23.7637, 90.399],
  Uttara: [23.8759, 90.3795],
  Wari: [23.7186, 90.4185],
};

export const DHAKA_AREAS = Object.keys(AREA_CENTERS);

export const findAreaCenter = (area: string | undefined): LatLng | null => {
  const name = area?.trim().toLowerCase();
  const match = DHAKA_AREAS.find((item) => item.toLowerCase() === name);

  return match ? AREA_CENTERS[match] : null;
};

export const directionsLink = (latitude: number, longitude: number) =>
  `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

export const mapLink = (latitude: number, longitude: number) =>
  `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
