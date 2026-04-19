import type { OutlookCollection } from "../types/outlook";
import { RISK_COLORS, RISK_LABELS, RISK_ORDER } from "../config/spcLayers";

interface LegendProps {
  data: OutlookCollection | null;
}

export function Legend({ data }: LegendProps) {
  if (!data || data.features.length === 0) return null;

  // Get unique risk labels present in the data
  const activeLabels = [
    ...new Set(data.features.map((f) => f.properties.label)),
  ].sort((a, b) => (RISK_ORDER[a] ?? -1) - (RISK_ORDER[b] ?? -1));

  return (
    <div className="legend">
      <h4>Risk Categories</h4>
      {activeLabels.map((label) => {
        const color =
          data.features.find((f) => f.properties.label === label)?.properties
            .fill || RISK_COLORS[label];
        return (
          <div key={label} className="legend-item">
            <span
              className="legend-swatch"
              style={{ backgroundColor: color }}
            />
            <span className="legend-label">
              {RISK_LABELS[label] || label} ({label})
            </span>
          </div>
        );
      })}
    </div>
  );
}
