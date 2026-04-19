import type { DailyForecast, HourlyForecast } from "../types/tempest";
import { computeRainWindow, computeWindWindow } from "../utils/forecast";

interface Props {
  tomorrow: DailyForecast;
  hourly: HourlyForecast[];
}

function fmtSun(t: number): string {
  return new Date(t * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function TomorrowCard({ tomorrow, hourly }: Props) {
  const rain = computeRainWindow(hourly, tomorrow);
  const wind = computeWindWindow(hourly, tomorrow);

  return (
    <div className="tomorrow-card">
      <div className="cw-label">Tomorrow</div>
      <div className="tomorrow-conditions">{tomorrow.conditions}</div>
      <div className="tomorrow-hilo">
        <span className="daily-high">{Math.round(tomorrow.air_temp_high)}&deg;</span>
        {" / "}
        <span className="daily-low">{Math.round(tomorrow.air_temp_low)}&deg;</span>
      </div>
      {(rain || wind) && (
        <div className="tomorrow-badges">
          {rain && (
            <span className={`tomorrow-badge ${rain.heavy ? "tomorrow-badge-rain-heavy" : "tomorrow-badge-rain"}`}>
              {rain.heavy ? "🌧️" : "☔"} {rain.peakProb}%
            </span>
          )}
          {wind && (
            <span className={`tomorrow-badge ${wind.high ? "tomorrow-badge-wind-high" : "tomorrow-badge-wind"}`}>
              {wind.high ? "💨" : "🌬️"} {wind.maxGust} mph
            </span>
          )}
        </div>
      )}
      <div className="tomorrow-sun">
        Sunrise {fmtSun(tomorrow.sunrise)} &middot; Sunset {fmtSun(tomorrow.sunset)}
      </div>
    </div>
  );
}
