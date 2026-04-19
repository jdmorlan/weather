export type MapMode = "outlook" | "radar";

interface Props {
  mode: MapMode;
  onChange: (mode: MapMode) => void;
}

export function MapModeToggle({ mode, onChange }: Props) {
  return (
    <div className="map-mode-toggle" role="tablist" aria-label="Map overlay">
      <button
        type="button"
        role="tab"
        aria-selected={mode === "radar"}
        className={`mode-btn ${mode === "radar" ? "active" : ""}`}
        onClick={() => onChange("radar")}
      >
        Radar
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "outlook"}
        className={`mode-btn ${mode === "outlook" ? "active" : ""}`}
        onClick={() => onChange("outlook")}
      >
        SPC Outlook
      </button>
    </div>
  );
}
