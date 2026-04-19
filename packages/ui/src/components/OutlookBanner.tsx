import { useMemo } from "react";
import type { OutlookCollection } from "../types/outlook";
import type { HazardData } from "../hooks/useOutlookData";
import { HOME_COORDS, RISK_LABELS, RISK_ORDER } from "../config/spcLayers";
import { getHomeOutlookRisk, getHazardProbability, type HomeOutlookRisk } from "../utils/geo";

const HAZARD_COLORS = {
  tornado: "#e94560",
  hail: "#4caf50",
  wind: "#ff9800",
} as const;

const HAZARD_LABELS = {
  tornado: "Tornado",
  hail: "Hail",
  wind: "Wind",
} as const;

const HAZARD_TYPES = ["tornado", "hail", "wind"] as const;

interface DayOutlook {
  label: string;
  risk: HomeOutlookRisk;
  hazards: { type: (typeof HAZARD_TYPES)[number]; prob: number }[];
}

interface OutlookBannerProps {
  outlookByDay: [OutlookCollection | null, OutlookCollection | null];
  hazardByDay: [HazardData, HazardData];
  onNavigate: () => void;
}

function useDayOutlook(
  outlookData: OutlookCollection | null,
  hazardData: HazardData,
  label: string
): DayOutlook | null {
  return useMemo(() => {
    if (!outlookData) return null;
    const risk = getHomeOutlookRisk(HOME_COORDS[0], HOME_COORDS[1], outlookData);
    if (!risk) return null;
    const [lat, lng] = HOME_COORDS;
    const hazards = HAZARD_TYPES.map((type) => ({
      type,
      prob: hazardData[type] ? getHazardProbability(lat, lng, hazardData[type]!) : 0,
    })).filter((h) => h.prob > 0);
    return { label, risk, hazards };
  }, [outlookData, hazardData, label]);
}

export function OutlookBanner({ outlookByDay, hazardByDay, onNavigate }: OutlookBannerProps) {
  const today = useDayOutlook(outlookByDay[0], hazardByDay[0], "Today");
  const tomorrow = useDayOutlook(outlookByDay[1], hazardByDay[1], "Tomorrow");

  const days = [today, tomorrow].filter((d): d is DayOutlook => d !== null);
  if (days.length === 0) return null;

  // Use the highest risk color for the outer banner border
  const highestRisk = days.reduce((best, d) => {
    const severity = RISK_ORDER[d.risk.label] ?? -1;
    const bestSeverity = RISK_ORDER[best.risk.label] ?? -1;
    return severity > bestSeverity ? d : best;
  });

  return (
    <div className="outlook-banner" style={{ borderColor: highestRisk.risk.color }}>
      <div className="outlook-banner-content">
        <div className="outlook-banner-header">
          <div className="outlook-banner-text">
            Severe weather outlook applies to home
          </div>
          <button className="outlook-banner-link" onClick={onNavigate}>
            View Outlook
          </button>
        </div>
        {days.map((day) => {
          const riskName = RISK_LABELS[day.risk.label] ?? day.risk.label;
          return (
            <div key={day.label} className="outlook-banner-day">
              <div className="outlook-banner-day-label">
                <span className="outlook-banner-day-name">{day.label}</span>
                <span className="outlook-banner-risk" style={{ color: day.risk.color }}>
                  {riskName} Risk
                </span>
              </div>
              {day.hazards.length > 0 && (
                <div className="outlook-banner-hazards">
                  {day.hazards.map((h) => (
                    <div
                      key={h.type}
                      className="outlook-banner-hazard"
                      style={{ borderColor: HAZARD_COLORS[h.type] }}
                    >
                      <span className="outlook-banner-hazard-label">
                        {HAZARD_LABELS[h.type]}
                      </span>
                      <span
                        className="outlook-banner-hazard-prob"
                        style={{ color: HAZARD_COLORS[h.type] }}
                      >
                        {h.prob}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
