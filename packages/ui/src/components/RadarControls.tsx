import { useEffect } from "react";
import type { RadarFrame } from "../hooks/useRadarFrames";
import { RADAR_FRAME_MS } from "../config/radar";

interface Props {
  frames: RadarFrame[];
  activeIdx: number;
  playing: boolean;
  onActiveIdxChange: (i: number) => void;
  onPlayingChange: (playing: boolean) => void;
}

export function RadarControls({
  frames,
  activeIdx,
  playing,
  onActiveIdxChange,
  onPlayingChange,
}: Props) {
  useEffect(() => {
    if (!playing || frames.length === 0) return;
    const id = setInterval(() => {
      onActiveIdxChange((activeIdx + 1) % frames.length);
    }, RADAR_FRAME_MS);
    return () => clearInterval(id);
  }, [playing, activeIdx, frames.length, onActiveIdxChange]);

  // Keyboard: ← → step frames (pauses), space toggles play. Skipped when the
  // user is in a form control so slider/button native behavior still works.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON") {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPlayingChange(false);
        onActiveIdxChange((activeIdx - 1 + frames.length) % frames.length);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onPlayingChange(false);
        onActiveIdxChange((activeIdx + 1) % frames.length);
      } else if (e.key === " ") {
        e.preventDefault();
        onPlayingChange(!playing);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [activeIdx, playing, frames.length, onActiveIdxChange, onPlayingChange]);

  const current = frames[activeIdx];
  if (!current) return null;

  const time = new Date(current.time * 1000);
  const isLatest = activeIdx === frames.length - 1;

  return (
    <div className="radar-controls">
      <button
        type="button"
        className="radar-play-btn"
        onClick={() => onPlayingChange(!playing)}
        aria-label={playing ? "Pause radar" : "Play radar"}
      >
        {playing ? "⏸" : "▶"}
      </button>
      <input
        type="range"
        min={0}
        max={frames.length - 1}
        value={activeIdx}
        onChange={(e) => onActiveIdxChange(Number(e.target.value))}
        className="radar-slider"
        aria-label="Radar timeline"
      />
      <div className="radar-time">
        {time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        {isLatest && <span className="radar-latest-badge">latest</span>}
      </div>
    </div>
  );
}
