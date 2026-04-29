export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
}
export interface NHCMetadata {
  niche: string;
  title?: string;
  description?: string;
  intro?: string;
  revision?: string;
  author: string;
  permlink: string;
}
export interface NHCRecord {
  id: string;
  uri: string;
  created: string;
  updated: string;
  tags: string[];
  metadata: NHCMetadata;
  original: HypothesisAnnotation;
}
export interface HypothesisSelector {
  type: string;
  exact?: string;
  prefix?: string;
  suffix?: string;
  start?: number;
  end?: number;
}
export interface HypothesisTarget {
  source: string;
  selector?: HypothesisSelector[];
}
export interface HypothesisAnnotation {
  id: string;
  uri: string;
  text: string;
  user: string;
  tags: string[];
  created: string;
  updated: string;
  title?: string;
  target: HypothesisTarget[];
  document?: {
    title?: string[];
  };
}
export interface HypothesisSearchResponse {
  total: number;
  rows: HypothesisAnnotation[];
}
export interface HivePost {
  author: string;
  permlink: string;
  title: string;
  body: string;
  created: string;
  updated: string;
  json_metadata?: string;
}