import { GeoJSON } from "react-leaflet";
import type { Feature, Geometry } from "geojson";
import type { PathOptions } from "leaflet";
import type { OutlookCollection, OutlookProperties } from "../types/outlook";
import { RISK_COLORS, RISK_ORDER } from "../config/spcLayers";

interface OutlookLayerProps {
  data: OutlookCollection;
  day: number;
}

export function OutlookLayer({ data, day }: OutlookLayerProps) {
  // Sort features so highest severity renders on top
  const sorted = {
    ...data,
    features: [...data.features].sort((a, b) => {
      const orderA = RISK_ORDER[a.properties.label] ?? -1;
      const orderB = RISK_ORDER[b.properties.label] ?? -1;
      return orderA - orderB;
    }),
  };

  return (
    <GeoJSON
      key={`outlook-day-${day}-${data.features.length}`}
      data={sorted}
      style={(feature?: Feature<Geometry, OutlookProperties>): PathOptions => {
        const props = feature?.properties;
        const fill = props?.fill || RISK_COLORS[props?.label ?? ""] || "#cccccc";
        const stroke = props?.stroke || fill;
        return {
          fillColor: fill,
          fillOpacity: 0.35,
          color: stroke,
          weight: 1.5,
          opacity: 0.8,
        };
      }}
      onEachFeature={(feature, layer) => {
        const label = feature.properties?.label;
        const label2 = feature.properties?.label2;
        if (label) {
          layer.bindTooltip(label2 || label, {
            sticky: true,
            direction: "top",
          });
        }
      }}
    />
  );
}
