import type { DayNumber } from "../types/outlook";
import { getDayLabel } from "../config/spcLayers";

interface DaySelectorProps {
  selected: DayNumber;
  onChange: (day: DayNumber) => void;
}

const days: DayNumber[] = [1, 2, 3];

export function DaySelector({ selected, onChange }: DaySelectorProps) {
  return (
    <div className="day-selector">
      {days.map((day) => (
        <button
          key={day}
          className={`day-btn ${selected === day ? "active" : ""}`}
          onClick={() => onChange(day)}
        >
          {getDayLabel(day)}
        </button>
      ))}
    </div>
  );
}
