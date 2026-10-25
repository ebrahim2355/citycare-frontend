import { describe, expect, it } from "vitest";
import { AREA_CENTERS, directionsLink, findAreaCenter } from "@/lib/areas";
import { distanceMeters, formatDistance, nearestArea, roundCoordinate } from "@/lib/geo";

describe("distanceMeters", () => {
  it("is zero for the same point and symmetric", () => {
    expect(distanceMeters([23.78, 90.4], [23.78, 90.4])).toBe(0);
    expect(distanceMeters(AREA_CENTERS.Gulshan, AREA_CENTERS.Banani)).toBeCloseTo(distanceMeters(AREA_CENTERS.Banani, AREA_CENTERS.Gulshan));
  });

  it("matches known distances in Dhaka", () => {
    const uttaraToMotijheel = distanceMeters(AREA_CENTERS.Uttara, AREA_CENTERS.Motijheel);

    expect(uttaraToMotijheel).toBeGreaterThan(15000);
    expect(uttaraToMotijheel).toBeLessThan(17500);
    expect(distanceMeters([23.78, 90.4], [23.781, 90.4])).toBeCloseTo(111, 0);
  });
});

describe("nearestArea", () => {
  it("names the closest neighbourhood for a pin", () => {
    expect(nearestArea([23.7465, 90.3745])).toBe("Dhanmondi");
    expect(nearestArea([23.8765, 90.38])).toBe("Uttara");
  });

  it("gives up outside the city", () => {
    expect(nearestArea([22.3569, 91.7832])).toBeNull();
  });
});

describe("helpers", () => {
  it("finds an area center in any letter case", () => {
    expect(findAreaCenter(" mirpur ")).toEqual(AREA_CENTERS.Mirpur);
    expect(findAreaCenter("Atlantis")).toBeNull();
    expect(findAreaCenter(undefined)).toBeNull();
  });

  it("formats distances for people", () => {
    expect(formatDistance(4)).toBe("10 m");
    expect(formatDistance(184)).toBe("180 m");
    expect(formatDistance(1530)).toBe("1.5 km");
  });

  it("rounds coordinates to about ten centimetres", () => {
    expect(roundCoordinate(23.780812345)).toBe(23.780812);
  });

  it("builds a directions link", () => {
    expect(directionsLink(23.75, 90.37)).toBe("https://www.google.com/maps/dir/?api=1&destination=23.75,90.37");
  });
});
