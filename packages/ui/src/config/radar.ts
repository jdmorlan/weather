// Radar source: Iowa Environmental Mesonet NEXRAD composite (N0Q = base
// reflectivity, quality-controlled). CONUS-wide, 5-minute cadence, direct
// from NEXRAD Level II. CORS-friendly.
//
// IEM uses *relative* TMS layer names for history:
//   nexrad-n0q-900913          current
//   nexrad-n0q-m05m-900913     5 min ago
//   nexrad-n0q-m10m-900913     10 min ago
// ...up to about m55m. Frame times are approximate — the named slug returns
// "whatever scan was ~XX min old at request time" from the IEM server.
export const RADAR_FRAME_COUNT = 12;            // 12 × 5min = 1 hour of history
export const RADAR_INTERVAL_MIN = 5;            // NEXRAD update cadence
export const RADAR_REFRESH_MS = 60 * 1000;      // how often we regenerate time labels
export const RADAR_FRAME_MS = 500;              // playback frame speed

// NWS active alerts (proxied through our server because NWS requires User-Agent).
export const NWS_AREA = "TX";
export const NWS_REFRESH_MS = 60 * 1000;

export function radarLayerName(minutesAgo: number): string {
  if (minutesAgo === 0) return "nexrad-n0q-900913";
  const xx = String(minutesAgo).padStart(2, "0");
  return `nexrad-n0q-m${xx}m-900913`;
}

export function radarTileUrl(layerName: string): string {
  return `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/${layerName}/{z}/{x}/{y}.png`;
}

export const WARNING_COLORS: Record<string, string> = {
  "Tornado Emergency": "#ff00ff",
  "Tornado Warning": "#ff0000",
  "Flash Flood Emergency": "#ff0080",
  "Severe Thunderstorm Warning": "#ff8800",
  "Flash Flood Warning": "#00aa44",
  "Flood Warning": "#00aa88",
  "Tornado Watch": "#ffff00",
  "Severe Thunderstorm Watch": "#ffcc00",
  "Flood Watch": "#66ccaa",
};

export const WARNING_ORDER: Record<string, number> = {
  "Flood Watch": 1,
  "Severe Thunderstorm Watch": 2,
  "Tornado Watch": 3,
  "Flood Warning": 4,
  "Flash Flood Warning": 5,
  "Severe Thunderstorm Warning": 6,
  "Flash Flood Emergency": 7,
  "Tornado Warning": 8,
  "Tornado Emergency": 9,
};

export const WARNING_DEFAULT_COLOR = "#888888";
