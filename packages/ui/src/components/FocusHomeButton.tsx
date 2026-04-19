import { useMap } from "react-leaflet";
import { HOME_COORDS } from "../config/spcLayers";

const HOME_ZOOM = 10;

export function FocusHomeButton() {
  const map = useMap();
  return (
    <button
      type="button"
      className="focus-home-btn"
      onClick={() => map.setView(HOME_COORDS, HOME_ZOOM)}
      aria-label="Center on Hamilton County"
      title="Center on Hamilton County"
    >
      🏠
    </button>
  );
}
