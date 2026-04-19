import { MapContainer, TileLayer } from "react-leaflet";
import { MAP_CENTER, MAP_ZOOM } from "../config/spcLayers";
import { CountyLayer } from "./CountyLayer";
import { OutlookLayer } from "./OutlookLayer";
import { RadarLayer } from "./RadarLayer";
import { WarningsLayer } from "./WarningsLayer";
import { FocusHomeButton } from "./FocusHomeButton";
import type { MapMode } from "./MapModeToggle";
import type { OutlookCollection, DayNumber } from "../types/outlook";
import type { RadarFrame } from "../hooks/useRadarFrames";
import type { FeatureCollection } from "geojson";

interface WeatherMapProps {
  mode: MapMode;
  outlookData: OutlookCollection | null;
  day: DayNumber;
  radarFrames: RadarFrame[];
  radarActiveIdx: number;
  warnings: FeatureCollection | null;
}

export function WeatherMap({
  mode,
  outlookData,
  day,
  radarFrames,
  radarActiveIdx,
  warnings,
}: WeatherMapProps) {
  const activeLayerName = radarFrames[radarActiveIdx]?.layerName ?? null;
  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      className="weather-map"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {mode === "radar" && activeLayerName && (
        <RadarLayer frames={radarFrames} activeLayerName={activeLayerName} />
      )}
      {mode === "outlook" && outlookData && outlookData.features.length > 0 && (
        <OutlookLayer data={outlookData} day={day} />
      )}
      <CountyLayer />
      {warnings && <WarningsLayer data={warnings} />}
      <FocusHomeButton />
    </MapContainer>
  );
}
