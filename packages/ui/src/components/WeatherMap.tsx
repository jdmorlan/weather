import { MapContainer, TileLayer } from "react-leaflet";
import { MAP_CENTER, MAP_ZOOM } from "../config/spcLayers";
import { CountyLayer } from "./CountyLayer";
import { OutlookLayer } from "./OutlookLayer";
import type { OutlookCollection, DayNumber } from "../types/outlook";

interface WeatherMapProps {
  outlookData: OutlookCollection | null;
  day: DayNumber;
}

export function WeatherMap({ outlookData, day }: WeatherMapProps) {
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
      {outlookData && outlookData.features.length > 0 && (
        <OutlookLayer data={outlookData} day={day} />
      )}
      <CountyLayer />
    </MapContainer>
  );
}
