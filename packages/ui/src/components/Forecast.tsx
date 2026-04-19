import { useState } from "react";
import type { DailyForecast, HourlyForecast } from "../types/tempest";

interface ForecastProps {
  daily: DailyForecast[];
  hourly: HourlyForecast[];
}

type ForecastView = "today" | "weekly";

// Thresholds for rain indicators (inches)
const HOURLY_RAIN_THRESHOLD = 0.01; // any measurable rain
const HOURLY_HEAVY_THRESHOLD = 0.10; // heavy rain — mud-maker
const DAILY_RAIN_THRESHOLD = 0.10; // light rain day
const DAILY_HEAVY_THRESHOLD = 0.25; // heavy rain day

function precipClass(amount: number, rainThreshold: number, heavyThreshold: number): string {
  if (amount >= heavyThreshold) return "precip-heavy";
  if (amount >= rainThreshold) return "precip-rain";
  return "";
}

function isDaytime(time: number, daily: DailyForecast[]): boolean {
  for (const day of daily) {
    if (time >= day.sunrise && time < day.sunset) return true;
  }
  return false;
}

function computeDailyPrecip(
  daily: DailyForecast[],
  hourly: HourlyForecast[]
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

function computeRainWindow(hourly: HourlyForecast[], day: DailyForecast): string {
  const dayStart = day.day_start_local;
  const dayEnd = dayStart + 86400;
  const dayHours = hourly.filter((h) => h.time >= dayStart && h.time < dayEnd);

  const rainyHours = dayHours.filter((h) => h.precip_probability >= 30);

  if (rainyHours.length === 0) return "Dry all day";
  if (rainyHours.length === dayHours.length) return "Rain expected all day";

  const first = rainyHours[0];
  const last = rainyHours[rainyHours.length - 1];

  const fmt = (t: number) =>
    new Date(t * 1000).toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
    });

  return `Rain likely ${fmt(first.time)} \u2013 ${fmt(last.time)}`;
}

function formatSunTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function Forecast({ daily, hourly }: ForecastProps) {
  const [view, setView] = useState<ForecastView>("today");
  const [dayOffset, setDayOffset] = useState(0);
  const dailyPrecip = computeDailyPrecip(daily, hourly);

  return (
    <div className="forecast">
      <ViewToggle
        view={view}
        dayOffset={dayOffset}
        onViewChange={setView}
        onDayOffsetChange={setDayOffset}
      />
      {view === "today" ? (
        <TodayView
          daily={daily}
          hourly={hourly}
          dayOffset={dayOffset}
          dailyPrecip={dailyPrecip}
        />
      ) : (
        <WeeklyView daily={daily} dailyPrecip={dailyPrecip} />
      )}
    </div>
  );
}

function ViewToggle({
  view,
  dayOffset,
  onViewChange,
  onDayOffsetChange,
}: {
  view: ForecastView;
  dayOffset: number;
  onViewChange: (v: ForecastView) => void;
  onDayOffsetChange: (d: number) => void;
}) {
  return (
    <div className="forecast-view-toggle">
      <button
        className={`day-btn ${view === "today" && dayOffset === 0 ? "active" : ""}`}
        onClick={() => {
          onViewChange("today");
          onDayOffsetChange(0);
        }}
      >
        Today
      </button>
      <button
        className={`day-btn ${view === "today" && dayOffset === 1 ? "active" : ""}`}
        onClick={() => {
          onViewChange("today");
          onDayOffsetChange(1);
        }}
      >
        Tomorrow
      </button>
      <button
        className={`day-btn ${view === "weekly" ? "active" : ""}`}
        onClick={() => onViewChange("weekly")}
      >
        Weekly
      </button>
    </div>
  );
}


function DaySummary({
  day,
  hourly,
  precipAmount,
}: {
  day: DailyForecast;
  hourly: HourlyForecast[];
  precipAmount: number;
}) {
  const date = new Date(day.day_start_local * 1000);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const dayLabel = isToday
    ? "Today"
    : date.toLocaleDateString("en-US", { weekday: "long" });
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const rainWindow = computeRainWindow(hourly, day);

  return (
    <div className="day-summary">
      <div className="day-summary-header">
        <div className="day-summary-title">
          {dayLabel} &mdash; {dateLabel}
        </div>
        <div className="day-summary-conditions">{day.conditions}</div>
      </div>
      <div className="day-summary-details">
        <span className="day-summary-temps">
          <span className="daily-high">{Math.round(day.air_temp_high)}&deg;</span>
          {" / "}
          <span className="daily-low">{Math.round(day.air_temp_low)}&deg;</span>
        </span>
        <span className="day-summary-sun">
          Sunrise {formatSunTime(day.sunrise)} &middot; Sunset{" "}
          {formatSunTime(day.sunset)}
        </span>
      </div>
      <div className="day-summary-precip">
        {day.precip_probability}% chance of rain &middot; {precipAmount.toFixed(2)}&Prime;
        expected
      </div>
      <div className="day-summary-rain">{rainWindow}</div>
    </div>
  );
}

function TodayView({
  daily,
  hourly,
  dayOffset,
  dailyPrecip,
}: {
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  dayOffset: number;
  dailyPrecip: Map<number, number>;
}) {
  const day = daily[dayOffset];
  if (!day) return null;

  const dayStart = day.day_start_local;
  const dayEnd = dayStart + 86400;
  const dayHourly = hourly.filter((h) => h.time >= dayStart && h.time < dayEnd);
  const precipAmount = dailyPrecip.get(day.day_start_local) ?? 0;

  return (
    <>
      <DaySummary day={day} hourly={hourly} precipAmount={precipAmount} />
      <section className="forecast-section">
        <h3 className="forecast-heading">Hourly Forecast</h3>
        <div className="forecast-hourly">
          {dayHourly.map((hour) => (
            <HourlyCell
              key={hour.time}
              hour={hour}
              daytime={isDaytime(hour.time, daily)}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function WeeklyView({
  daily,
  dailyPrecip,
}: {
  daily: DailyForecast[];
  dailyPrecip: Map<number, number>;
}) {
  const totalPrecip = daily
    .slice(0, 10)
    .reduce((sum, day) => sum + (dailyPrecip.get(day.day_start_local) ?? 0), 0);

  return (
    <section className="forecast-section">
      <div className="forecast-heading-row">
        <h3 className="forecast-heading">10-Day Forecast</h3>
        {totalPrecip > 0 && (
          <span className="weekly-precip-total">
            {totalPrecip.toFixed(2)}&Prime; total rain
          </span>
        )}
      </div>
      <div className="forecast-daily">
        {daily.slice(0, 10).map((day) => (
          <DailyCard
            key={day.day_start_local}
            day={day}
            precipAmount={dailyPrecip.get(day.day_start_local) ?? 0}
          />
        ))}
      </div>
    </section>
  );
}

function DailyCard({
  day,
  precipAmount,
}: {
  day: DailyForecast;
  precipAmount: number;
}) {
  const date = new Date(day.day_start_local * 1000);
  const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
  const dateLabel = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const rainClass = precipClass(precipAmount, DAILY_RAIN_THRESHOLD, DAILY_HEAVY_THRESHOLD);

  return (
    <div className={`daily-card ${rainClass}`}>
      <div className="daily-day">{dayLabel}</div>
      <div className="daily-date">{dateLabel}</div>
      <div className="daily-conditions">{day.conditions}</div>
      <div className="daily-temps">
        <span className="daily-high">{Math.round(day.air_temp_high)}&deg;</span>
        <span className="daily-low">{Math.round(day.air_temp_low)}&deg;</span>
      </div>
      {day.precip_probability > 0 && (
        <div className="daily-precip">
          {day.precip_probability}%
          <span className="precip-amount">{precipAmount.toFixed(2)}&Prime;</span>
        </div>
      )}
    </div>
  );
}

function HourlyCell({ hour, daytime }: { hour: HourlyForecast; daytime: boolean }) {
  const date = new Date(hour.time * 1000);
  const timeLabel = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
  });

  const rainClass = precipClass(hour.precip, HOURLY_RAIN_THRESHOLD, HOURLY_HEAVY_THRESHOLD);

  return (
    <div className={`hourly-cell ${daytime ? "hourly-day" : "hourly-night"} ${rainClass}`}>
      <div className="hourly-time">{timeLabel}</div>
      <div className="hourly-temp">{Math.round(hour.air_temperature)}&deg;</div>
      <div className="hourly-wind">
        {hour.wind_direction_cardinal} {Math.round(hour.wind_avg)}
      </div>
      {hour.precip_probability > 0 && (
        <div className="hourly-precip">
          {hour.precip_probability}%
          {hour.precip > 0 && (
            <span className="precip-amount">{hour.precip.toFixed(2)}&Prime;</span>
          )}
        </div>
      )}
    </div>
  );
}
