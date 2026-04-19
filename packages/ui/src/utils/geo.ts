import type { Geometry, Position } from "geojson";
import type { OutlookCollection, OutlookProperties } from "../types/outlook";
import { RISK_ORDER } from "../config/spcLayers";

/**
 * Ray-casting point-in-polygon test.
 * `ring` is an array of [lng, lat] positions (GeoJSON order).
 */
function pointInRing(lng: number, lat: number, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInGeometry(lat: number, lng: number, geometry: Geometry): boolean {
  switch (geometry.type) {
    case "Polygon":
      // First ring is exterior, rest are holes
      if (!pointInRing(lng, lat, geometry.coordinates[0])) return false;
      for (let i = 1; i < geometry.coordinates.length; i++) {
        if (pointInRing(lng, lat, geometry.coordinates[i])) return false;
      }
      return true;
    case "MultiPolygon":
      for (const polygon of geometry.coordinates) {
        if (pointInRing(lng, lat, polygon[0])) {
          let inHole = false;
          for (let i = 1; i < polygon.length; i++) {
            if (pointInRing(lng, lat, polygon[i])) {
              inHole = true;
              break;
            }
          }
          if (!inHole) return true;
        }
      }
      return false;
    default:
      return false;
  }
}

/**
 * Find the highest probabilistic `dn` value (> 0) for polygons containing the point.
 * Returns the percentage number, or 0 if the point is outside all polygons.
 */
export function getHazardProbability(
  lat: number,
  lng: number,
  data: OutlookCollection
): number {
  let best = 0;
  for (const feature of data.features) {
    const dn = feature.properties.dn;
    if (dn <= 0 || dn <= best) continue;
    if (pointInGeometry(lat, lng, feature.geometry)) {
      best = dn;
    }
  }
  return best;
}

export interface HomeOutlookRisk {
  label: string;
  color: string;
}

/**
 * Find the highest-severity outlook risk that contains the given point.
 * Returns null if the point is outside all outlook polygons.
 */
export function getHomeOutlookRisk(
  lat: number,
  lng: number,
  data: OutlookCollection
): HomeOutlookRisk | null {
  let best: (OutlookProperties & { severity: number }) | null = null;

  for (const feature of data.features) {
    if (!pointInGeometry(lat, lng, feature.geometry)) continue;
    const severity = RISK_ORDER[feature.properties.label] ?? -1;
    if (!best || severity > best.severity) {
      best = { ...feature.properties, severity };
    }
  }

  if (!best) return null;
  return { label: best.label, color: best.fill || best.stroke };
}
