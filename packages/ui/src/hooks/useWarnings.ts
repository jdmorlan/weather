import { useEffect, useState } from "react";
import type { FeatureCollection } from "geojson";
import { NWS_AREA, NWS_REFRESH_MS } from "../config/radar";

export function useWarnings(): FeatureCollection | null {
  const [data, setData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchWarnings = async () => {
      try {
        const res = await fetch(`/api/nws/alerts/active?area=${NWS_AREA}`);
        if (!res.ok) return;
        const json = (await res.json()) as FeatureCollection;
        if (!cancelled) setData(json);
      } catch {
        // retry on interval
      }
    };

    fetchWarnings();
    const id = setInterval(fetchWarnings, NWS_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return data;
}
