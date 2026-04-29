export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
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