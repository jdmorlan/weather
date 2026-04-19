export function getTempestForecastUrl(): string {
  return `/api/tempest/better_forecast?units_temp=f&units_wind=mph&units_pressure=inhg&units_precip=in&units_distance=mi`;
}

export const TEMPEST_REFRESH_MS = 5 * 60 * 1000;

const CARDINALS = [
  "N", "NNE", "NE", "ENE",
  "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW",
  "W", "WNW", "NW", "NNW",
];

export function degreesToCardinal(deg: number): string {
  const index = Math.round(deg / 22.5) % 16;
  return CARDINALS[index];
}
