import { GeoJSON } from "react-leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { PathOptions } from "leaflet";
import {
  WARNING_COLORS,
  WARNING_DEFAULT_COLOR,
  WARNING_ORDER,
} from "../config/radar";

interface WarningProperties {
  event?: string;
  headline?: string;
  senderName?: string;
  severity?: string;
}

export function WarningsLayer({ data }: { data: FeatureCollection }) {
  // Filter to alerts with a polygon (some are zone-based without geometry).
  const withGeom = data.features.filter((f) => f.geometry);
  if (withGeom.length === 0) return null;

  // Sort so higher-severity renders on top (later in array = drawn last in Leaflet).
  const sorted = [...withGeom].sort((a, b) => {
    const ap = (a.properties as WarningProperties | null) ?? {};
    const bp = (b.properties as WarningProperties | null) ?? {};
    const ao = WARNING_ORDER[ap.event ?? ""] ?? 0;
    const bo = WARNING_ORDER[bp.event ?? ""] ?? 0;
    return ao - bo;
  });

  const collection: FeatureCollection = { ...data, features: sorted };

  return (
    <GeoJSON
      key={`warnings-${withGeom.length}-${withGeom[0]?.id ?? ""}`}
      data={collection}
      style={(feature?: Feature<Geometry, WarningProperties>): PathOptions => {
        const event = feature?.properties?.event ?? "";
        const color = WARNING_COLORS[event] ?? WARNING_DEFAULT_COLOR;
        const severity = WARNING_ORDER[event] ?? 0;
        return {
          color,
          weight: severity >= 5 ? 3 : 2,
          fillColor: color,
          fillOpacity: 0.1,
          opacity: 0.95,
        };
      }}
      onEachFeature={(feature, layer) => {
        const props = (feature.properties as WarningProperties | null) ?? {};
        if (props.event) {
          const headline = props.headline ? `<br/>${props.headline}` : "";
          layer.bindTooltip(`<strong>${props.event}</strong>${headline}`, {
            sticky: true,
            direction: "top",
          });
        }
      }}
    />
  );
}
