import { useState, useEffect, useCallback } from "react";
import type { DayNumber, OutlookCollection, OutlookState } from "../types/outlook";
import type { HazardType } from "../config/spcLayers";
import { getOutlookUrl, getHazardUrl, REFRESH_INTERVAL_MS } from "../config/spcLayers";

export function useOutlookData(day: DayNumber): OutlookState {
  const [state, setState] = useState<OutlookState>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const url = getOutlookUrl(day);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data: OutlookCollection = await response.json();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch outlook data",
      });
    }
  }, [day]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  return state;
}

export interface HazardData {
  tornado: OutlookCollection | null;
  hail: OutlookCollection | null;
  wind: OutlookCollection | null;
}

const HAZARD_TYPES: HazardType[] = ["tornado", "hail", "wind"];

export function useHazardData(day: 1 | 2): HazardData {
  const [data, setData] = useState<HazardData>({
    tornado: null,
    hail: null,
    wind: null,
  });

  const fetchAll = useCallback(async () => {
    const results = await Promise.all(
      HAZARD_TYPES.map(async (hazard) => {
        try {
          const res = await fetch(getHazardUrl(day, hazard));
          if (!res.ok) return null;
          return (await res.json()) as OutlookCollection;
        } catch {
          return null;
        }
      })
    );
    setData({
      tornado: results[0],
      hail: results[1],
      wind: results[2],
    });
  }, [day]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return data;
}
