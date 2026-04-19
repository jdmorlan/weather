import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import type { Layer, PathOptions } from "leaflet";

const countyStyle: PathOptions = {
  color: "#999",
  weight: 0.8,
  fillOpacity: 0,
  opacity: 0.6,
};

export function CountyLayer() {
  const [counties, setCounties] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch("/data/tx_counties.geojson")
      .then((res) => res.json())
      .then(setCounties)
      .catch((err) => console.error("Failed to load counties:", err));
  }, []);

  if (!counties) return null;

  return (
    <GeoJSON
      data={counties}
      style={countyStyle}
      onEachFeature={(feature, layer: Layer) => {
        const name = feature.properties?.NAME;
        if (name) {
          layer.bindTooltip(name, {
            sticky: true,
            direction: "top",
            className: "county-tooltip",
          });
        }
      }}
    />
  );
}
