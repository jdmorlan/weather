import { useEffect, useState } from "react";
import {
  RADAR_FRAME_COUNT,
  RADAR_INTERVAL_MIN,
  RADAR_REFRESH_MS,
  radarLayerName,
} from "../config/radar";

export interface RadarFrame {
  time: number;      // unix seconds — approximate wall-clock time for display
  layerName: string; // IEM TMS layer name
}

function generateFrames(count: number): RadarFrame[] {
  const nowSec = Math.floor(Date.now() / 1000);
  const frames: RadarFrame[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const minutesAgo = i * RADAR_INTERVAL_MIN;
    frames.push({
      time: nowSec - minutesAgo * 60,
      layerName: radarLayerName(minutesAgo),
    });
  }
  return frames;
}

export function useRadarFrames(): RadarFrame[] {
  const [frames, setFrames] = useState(() => generateFrames(RADAR_FRAME_COUNT));

  useEffect(() => {
    const id = setInterval(() => {
      setFrames(generateFrames(RADAR_FRAME_COUNT));
    }, RADAR_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return frames;
}
