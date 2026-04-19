import type { DailyForecast, HourlyForecast } from "../types/tempest";

export const RAIN_HOURLY_PROB = 30;
export const RAIN_HEAVY_HOURLY_PROB = 70;
export const RAIN_HEAVY_DAILY_INCHES = 0.25;

export const WIND_AVG_THRESHOLD = 15;
export const WIND_GUST_THRESHOLD = 20;
export const WIND_HIGH_AVG = 25;
export const WIND_HIGH_GUST = 35;

export interface RainWindow {
  start: number;
  end: number;
  peakProb: number;
  totalExpected: number;
  allDay: boolean;
  heavy: boolean;
}

export function computeRainWindow(
  hourly: HourlyForecast[],
  day: DailyForecast,
): RainWindow | null {
  const dayStart = day.day_start_local;
  const dayEnd = dayStart + 86400;
  const dayHours = hourly.filter((h) => h.time >= dayStart && h.time < dayEnd);

  const rainyHours = dayHours.filter((h) => h.precip_probability >= RAIN_HOURLY_PROB);
  if (rainyHours.length === 0) return null;

  const precipTotal = dayHours.reduce((sum, h) => sum + (h.precip ?? 0), 0);
  const peakProb = Math.max(...rainyHours.map((h) => h.precip_probability));
  const heavy =
    precipTotal >= RAIN_HEAVY_DAILY_INCHES || peakProb >= RAIN_HEAVY_HOURLY_PROB;

  return {
    start: rainyHours[0]!.time,
    end: rainyHours[rainyHours.length - 1]!.time,
    peakProb,
    totalExpected: precipTotal,
    allDay: rainyHours.length === dayHours.length,
    heavy,
  };
}

export interface WindWindow {
  start: number;
  end: number;
  maxGust: number;
  peakDirection: string;
  allDay: boolean;
  high: boolean;
}

export function computeWindWindow(
  hourly: HourlyForecast[],
  day: DailyForecast,
): WindWindow | null {
  const dayStart = day.day_start_local;
  const dayEnd = dayStart + 86400;
  const dayHours = hourly.filter((h) => h.time >= dayStart && h.time < dayEnd);

  const windyHours = dayHours.filter(
    (h) => h.wind_avg >= WIND_AVG_THRESHOLD || h.wind_gust >= WIND_GUST_THRESHOLD,
  );
  if (windyHours.length === 0) return null;

  const peakHour = windyHours.reduce((max, h) => (h.wind_gust > max.wind_gust ? h : max));
  const high = windyHours.some(
    (h) => h.wind_avg >= WIND_HIGH_AVG || h.wind_gust >= WIND_HIGH_GUST,
  );

  return {
    start: windyHours[0]!.time,
    end: windyHours[windyHours.length - 1]!.time,
    maxGust: Math.round(peakHour.wind_gust),
    peakDirection: peakHour.wind_direction_cardinal,
    allDay: windyHours.length === dayHours.length,
    high,
  };
}

export function computeDailyPrecip(
  daily: DailyForecast[],
  hourly: HourlyForecast[],
): Map<number, number> {
  const totals = new Map<number, number>();
  for (const day of daily) {
    const nextDay = day.day_start_local + 86400;
    let sum = 0;
    for (const h of hourly) {
      if (h.time >= day.day_start_local && h.time < nextDay) {
        sum += h.precip ?? 0;
      }
    }
    totals.set(day.day_start_local, sum);
  }
  return totals;
}
