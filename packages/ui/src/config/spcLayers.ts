import type { DayNumber } from "../types/outlook";
import type { LatLngTuple } from "leaflet";

export type HazardType = "tornado" | "hail" | "wind";

export const MAP_CENTER: LatLngTuple = [31.0, -98.5];
export const MAP_ZOOM = 7;

// Home location for point-in-polygon outlook checks
export const HOME_COORDS: LatLngTuple = [31.6932, -98.3424];

export const SPC_LAYER_IDS: Record<DayNumber, number> = {
  1: 1,
  2: 9,
  3: 17,
};

export const HAZARD_LAYER_IDS: Record<1 | 2, Record<HazardType, number>> = {
  1: { tornado: 3, hail: 5, wind: 7 },
  2: { tornado: 11, hail: 13, wind: 15 },
};

export function getHazardUrl(day: 1 | 2, hazard: HazardType): string {
  const layerId = HAZARD_LAYER_IDS[day][hazard];
  return `/api/spc/${layerId}/query?where=1%3D1&outFields=*&f=geojson`;
}

export function getOutlookUrl(day: DayNumber): string {
  const layerId = SPC_LAYER_IDS[day];
  return `/api/spc/${layerId}/query?where=1%3D1&outFields=*&f=geojson`;
}

// Severity order (lowest to highest) for z-ordering
export const RISK_ORDER: Record<string, number> = {
  TSTM: 0,
  "SIGN TSTM": 0,
  MRGL: 1,
  SLGT: 2,
  ENH: 3,
  MDT: 4,
  HIGH: 5,
};

// Fallback colors if API doesn't provide them
export const RISK_COLORS: Record<string, string> = {
  TSTM: "#c0e8c0",
  MRGL: "#66a366",
  SLGT: "#ffe066",
  ENH: "#ffa500",
  MDT: "#ff0000",
  HIGH: "#ff00ff",
};

export const RISK_LABELS: Record<string, string> = {
  TSTM: "Thunderstorm",
  MRGL: "Marginal",
  SLGT: "Slight",
  ENH: "Enhanced",
  MDT: "Moderate",
  HIGH: "High",
};

export function getDayLabel(day: DayNumber): string {
  const today = new Date();
  const target = new Date(today);
  target.setDate(today.getDate() + (day - 1));

  if (day === 1) return "Today";
  if (day === 2) return "Tomorrow";
  return target.toLocaleDateString("en-US", { weekday: "long" });
}

/** Parse SPC timestamp like "202603012000" into a Date */
export function parseSpcTimestamp(ts: string): Date | null {
  if (!ts || ts.length < 12) return null;
  const year = parseInt(ts.slice(0, 4));
  const month = parseInt(ts.slice(4, 6)) - 1;
  const day = parseInt(ts.slice(6, 8));
  const hour = parseInt(ts.slice(8, 10));
  const min = parseInt(ts.slice(10, 12));
  return new Date(Date.UTC(year, month, day, hour, min));
}

export function formatSpcTimestamp(ts: string): string {
  const date = parseSpcTimestamp(ts);
  if (!date) return ts;
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
