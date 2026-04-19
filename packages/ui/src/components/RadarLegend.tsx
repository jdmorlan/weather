// Approximate intensity bins for RainViewer color scheme 6 (NEXRAD Level-III).
// Colors match the tile palette; labels are conventional NWS reflectivity ranges.
const BINS: Array<{ color: string; label: string }> = [
  { color: "#04e9e7", label: "Very light" },
  { color: "#04a400", label: "Light" },
  { color: "#e4e400", label: "Moderate" },
  { color: "#ff9000", label: "Heavy" },
  { color: "#d40000", label: "Very heavy" },
  { color: "#c800c8", label: "Extreme" },
];

export function RadarLegend() {
  return (
    <div className="radar-legend" aria-label="Radar intensity">
      <div className="radar-legend-title">Reflectivity</div>
      <div className="radar-legend-bar" role="img" aria-hidden="true">
        {BINS.map((b) => (
          <div
            key={b.color}
            className="radar-legend-swatch"
            style={{ backgroundColor: b.color }}
          />
        ))}
      </div>
      <div className="radar-legend-ends">
        <span>{BINS[0]!.label}</span>
        <span>{BINS[BINS.length - 1]!.label}</span>
      </div>
    </div>
  );
}
