import type { CurrentConditions, DailyForecast } from "../types/tempest";

interface CurrentWeatherProps {
  conditions: CurrentConditions;
  today?: DailyForecast;
}

function fmtSun(t: number): string {
  return new Date(t * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function CurrentWeather({ conditions, today }: CurrentWeatherProps) {
  const pressureTrendLabel =
    conditions.pressure_trend === "rising"
      ? "Rising"
      : conditions.pressure_trend === "falling"
        ? "Falling"
        : "Steady";

  return (
    <div className="current-weather">
      <div className="cw-label">Today</div>
      <div className="cw-hero">
        <div className="cw-temp">{Math.round(conditions.air_temperature)}&deg;</div>
        <div className="cw-meta">
          <div className="cw-conditions">{conditions.conditions}</div>
          <div className="cw-feels">Feels like {Math.round(conditions.feels_like)}&deg;</div>
          {today && (
            <div className="cw-hilo">
              <span className="daily-high">{Math.round(today.air_temp_high)}&deg;</span>
              {" / "}
              <span className="daily-low">{Math.round(today.air_temp_low)}&deg;</span>
            </div>
          )}
        </div>
      </div>
      {today && (
        <div className="cw-sun">
          Sunrise {fmtSun(today.sunrise)} &middot; Sunset {fmtSun(today.sunset)}
        </div>
      )}
      <div className="cw-grid">
        <DetailItem
          label="Wind"
          value={`${conditions.wind_direction_cardinal} ${Math.round(conditions.wind_avg)} mph`}
          sub={`Gusts ${Math.round(conditions.wind_gust)} mph`}
        />
        <DetailItem
          label="Humidity"
          value={`${conditions.relative_humidity}%`}
          sub={`Dew ${Math.round(conditions.dew_point)}\u00B0`}
        />
        <DetailItem
          label="Pressure"
          value={`${(conditions.sea_level_pressure ?? 0).toFixed(2)} inHg`}
          sub={pressureTrendLabel}
        />
        <DetailItem
          label="Precip Today"
          value={`${(conditions.precip_accum_local_day ?? 0).toFixed(2)} in`}
          sub={`Yest: ${(conditions.precip_accum_local_yesterday ?? 0).toFixed(2)} in`}
        />
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="cw-detail">
      <span className="cw-detail-label">{label}</span>
      <span className="cw-detail-value">{value}</span>
      {sub && <span className="cw-detail-sub">{sub}</span>}
    </div>
  );
}
