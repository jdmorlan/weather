import { TileLayer } from "react-leaflet";
import type { RadarFrame } from "../hooks/useRadarFrames";
import { radarTileUrl } from "../config/radar";

interface Props {
  frames: RadarFrame[];
  activeLayerName: string;
  opacity?: number;
}

// All frames mount at once and load their tiles on mount. Switching the
// active frame just flips opacity on already-loaded layers — no network
// fetch, no unmount, no flash between frames during playback.
export function RadarLayer({ frames, activeLayerName, opacity = 0.6 }: Props) {
  return (
    <>
      {frames.map((frame) => (
        <TileLayer
          key={frame.layerName}
          url={radarTileUrl(frame.layerName)}
          opacity={frame.layerName === activeLayerName ? opacity : 0}
          zIndex={400}
        />
      ))}
    </>
  );
}
