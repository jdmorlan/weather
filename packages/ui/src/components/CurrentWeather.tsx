import type { CurrentConditions } from "../types/tempest";

interface CurrentWeatherProps {
  conditions: CurrentConditions;
}

export function CurrentWeather({ conditions }: CurrentWeatherProps) {
  const pressureTrendLabel =
    conditions.pressure_trend === "rising"
      ? "Rising"
      : conditions.pressure_trend === "falling"
        ? "Falling"
        : "Steady";

  return (
    <div className="current-weather">
      <div className="cw-hero">
        <div className="cw-temp">{Math.round(conditions.air_temperature)}&deg;</div>
        <div className="cw-meta">
          <div className="cw-conditions">{conditions.conditions}</div>
          <div className="cw-feels">Feels like {Math.round(conditions.feels_like)}&deg;</div>
        </div>
      </div>
      <div className="cw-grid">
        <DetailItem label="Humidity" value={`${conditions.relative_humidity}%`} />
        <DetailItem label="Dew Point" value={`${Math.round(conditions.dew_point)}\u00B0F`} />
        <DetailItem
          label="Pressure"
          value={`${(conditions.sea_level_pressure ?? 0).toFixed(2)} inHg`}
          sub={pressureTrendLabel}
        />
        <DetailItem
          label="Wind"
          value={`${conditions.wind_direction_cardinal} ${Math.round(conditions.wind_avg)} mph`}
          sub={`Gusts ${Math.round(conditions.wind_gust)} mph`}
        />
        <DetailItem label="UV Index" value={String(conditions.uv)} />
        <DetailItem
          label="Solar Radiation"
          value={`${conditions.solar_radiation} W/m\u00B2`}
        />
        <DetailItem
          label="Lightning (1hr)"
          value={`${conditions.lightning_strike_count_last_1hr} strikes`}
          sub={
            conditions.lightning_strike_last_distance > 0
              ? `Last @ ${conditions.lightning_strike_last_distance} mi`
              : undefined
          }
        />
        <DetailItem
          label="Precip Today"
          value={`${(conditions.precip_accum_local_day ?? 0).toFixed(2)} in`}
          sub={`Yesterday: ${(conditions.precip_accum_local_yesterday ?? 0).toFixed(2)} in`}
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
