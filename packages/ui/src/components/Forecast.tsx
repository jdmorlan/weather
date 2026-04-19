import type { DailyForecast, HourlyForecast } from "../types/tempest";
import {
  computeDailyPrecip,
  computeRainWindow,
  computeWindWindow,
} from "../utils/forecast";

interface ForecastProps {
  daily: DailyForecast[];
  hourly: HourlyForecast[];
}

// Thresholds for hourly/daily precip indicator styling (inches).
const HOURLY_RAIN_THRESHOLD = 0.01;
const HOURLY_HEAVY_THRESHOLD = 0.10;
const DAILY_RAIN_THRESHOLD = 0.10;
const DAILY_HEAVY_THRESHOLD = 0.25;

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

export function Forecast({ daily, hourly }: ForecastProps) {
  const today = daily[0];
  if (!today) return null;

  const dailyPrecip = computeDailyPrecip(daily, hourly);
  const dayStart = today.day_start_local;
  const dayEnd = dayStart + 86400;
  const dayHourly = hourly.filter((h) => h.time >= dayStart && h.time < dayEnd);

  return (
    <div className="forecast">
      <RainCard day={today} hourly={hourly} />
      <WindCard day={today} hourly={hourly} />
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
      <WeeklyView daily={daily} dailyPrecip={dailyPrecip} />
    </div>
  );
}

function RainCard({ day, hourly }: { day: DailyForecast; hourly: HourlyForecast[] }) {
  const rain = computeRainWindow(hourly, day);
  if (!rain) return null;

  const fmt = (t: number) =>
    new Date(t * 1000).toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
  const windowText = rain.allDay
    ? "All day"
    : rain.start === rain.end
      ? `around ${fmt(rain.start)}`
      : `${fmt(rain.start)} \u2013 ${fmt(rain.end)}`;
  const label = rain.heavy ? "Heavy rain" : "Rain likely";

  return (
    <div className={`rain-card ${rain.heavy ? "rain-card-heavy" : ""}`}>
      <div className="rain-card-header">
        <span className="rain-card-icon" aria-hidden="true">
          {rain.heavy ? "🌧️" : "☔"}
        </span>
        <span className="rain-card-title">{label}</span>
      </div>
      <div className="rain-card-detail">
        <span>{windowText}</span>
        <span className="rain-card-sep">&middot;</span>
        <span>peak {rain.peakProb}%</span>
        <span className="rain-card-sep">&middot;</span>
        <span>{rain.totalExpected.toFixed(2)}&Prime; expected</span>
      </div>
    </div>
  );
}

function WindCard({ day, hourly }: { day: DailyForecast; hourly: HourlyForecast[] }) {
  const wind = computeWindWindow(hourly, day);
  if (!wind) return null;

  const fmt = (t: number) =>
    new Date(t * 1000).toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
  const windowText = wind.allDay
    ? "All day"
    : wind.start === wind.end
      ? `around ${fmt(wind.start)}`
      : `${fmt(wind.start)} \u2013 ${fmt(wind.end)}`;
  const label = wind.high ? "High winds" : "Windy";

  return (
    <div className={`wind-card ${wind.high ? "wind-card-high" : ""}`}>
      <div className="wind-card-header">
        <span className="wind-card-icon" aria-hidden="true">
          {wind.high ? "💨" : "🌬️"}
        </span>
        <span className="wind-card-title">{label}</span>
      </div>
      <div className="wind-card-detail">
        <span>{windowText}</span>
        <span className="wind-card-sep">&middot;</span>
        <span>from {wind.peakDirection}</span>
        <span className="wind-card-sep">&middot;</span>
        <span>gusts to {wind.maxGust} mph</span>
      </div>
    </div>
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
