import type { OutlookCollection } from "../types/outlook";
import { formatSpcTimestamp } from "../config/spcLayers";

interface OutlookInfoProps {
  data: OutlookCollection | null;
  loading: boolean;
  error: string | null;
}

export function OutlookInfo({ data, loading, error }: OutlookInfoProps) {
  if (loading) {
    return <div className="outlook-info loading">Loading outlook data...</div>;
  }

  if (error) {
    return <div className="outlook-info error">Error: {error}</div>;
  }

  if (!data || data.features.length === 0) {
    return <div className="outlook-info">No active outlook areas.</div>;
  }

  const firstFeature = data.features[0]?.properties;
  const valid = firstFeature?.valid;
  const expire = firstFeature?.expire;
  const issue = firstFeature?.issue;

  return (
    <div className="outlook-info">
      {issue && <span>Issued: {formatSpcTimestamp(issue)}</span>}
      {valid && expire && (
        <span>
          Valid: {formatSpcTimestamp(valid)} &mdash; {formatSpcTimestamp(expire)}
        </span>
      )}
    </div>
  );
}
