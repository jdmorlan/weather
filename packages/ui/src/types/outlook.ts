import type { FeatureCollection, Geometry } from "geojson";

export interface OutlookProperties {
  dn: number;
  idp_source: string;
  idp_subset: string;
  label: string;
  label2: string;
  fill: string;
  stroke: string;
  expire: string;
  issue: string;
  valid: string;
  [key: string]: unknown;
}

export type OutlookCollection = FeatureCollection<Geometry, OutlookProperties>;

export type DayNumber = 1 | 2 | 3;

export interface OutlookState {
  data: OutlookCollection | null;
  loading: boolean;
  error: string | null;
}
