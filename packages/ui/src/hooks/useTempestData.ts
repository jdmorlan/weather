import { useState, useEffect, useCallback } from "react";
import type { TempestForecast } from "../types/tempest";
import { getTempestForecastUrl, TEMPEST_REFRESH_MS } from "../config/tempest";

interface TempestState {
  data: TempestForecast | null;
  loading: boolean;
  error: string | null;
}

export function useTempestData(): TempestState {
  const [state, setState] = useState<TempestState>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const url = getTempestForecastUrl();
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const json = await response.json();
      setState({
        data: json as TempestForecast,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error:
          err instanceof Error ? err.message : "Failed to fetch Tempest data",
      });
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, TEMPEST_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  return state;
}
