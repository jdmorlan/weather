export interface CurrentConditions {
  time: number;
  conditions: string;
  icon: string;
  air_temperature: number;
  feels_like: number;
  relative_humidity: number;
  dew_point: number;
  station_pressure: number;
  sea_level_pressure: number;
  pressure_trend: string;
  wind_avg: number;
  wind_gust: number;
  wind_direction: number;
  wind_direction_cardinal: string;
  uv: number;
  solar_radiation: number;
  brightness: number;
  lightning_strike_count_last_1hr: number;
  lightning_strike_count_last_3hr: number;
  lightning_strike_last_distance: number;
  precip_accum_local_day: number;
  precip_accum_local_yesterday: number;
  precip_minutes_local_day: number;
  is_precip_local_day_rain_check: boolean;
  is_precip_local_yesterday_rain_check: boolean;
}

export interface DailyForecast {
  day_num: number;
  day_start_local: number;
  month_num: number;
  conditions: string;
  icon: string;
  air_temp_high: number;
  air_temp_low: number;
  precip_probability: number;
  precip_type: string;
  sunrise: number;
  sunset: number;
}

export interface HourlyForecast {
  time: number;
  conditions: string;
  icon: string;
  air_temperature: number;
  feels_like: number;
  relative_humidity: number;
  precip: number;
  precip_probability: number;
  precip_type: string;
  wind_avg: number;
  wind_gust: number;
  wind_direction: number;
  wind_direction_cardinal: string;
  uv: number;
}

export interface TempestForecast {
  current_conditions: CurrentConditions;
  forecast: {
    daily: DailyForecast[];
    hourly: HourlyForecast[];
  };
}
