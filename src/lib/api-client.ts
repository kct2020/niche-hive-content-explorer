import { ApiResponse } from "../../shared/types"
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'unknown';
  latency: number;
  timestamp: string;
}
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const start = performance.now();
  try {
    const res = await fetch(path, { 
      headers: { 'Content-Type': 'application/json' }, 
      ...init 
    });
    const duration = performance.now() - start;
    const json = (await res.json()) as ApiResponse<T>;
    if (import.meta.env.DEV) {
      console.debug(`[API] ${init?.method || 'GET'} ${path} - ${res.status} (${duration.toFixed(0)}ms)`);
    }
    if (!res.ok || !json.success || json.data === undefined) {
      throw new Error(json.error || `Request to ${path} failed with status ${res.status}`);
    }
    return json.data;
  } catch (err) {
    console.error(`[API ERROR] ${path}:`, err);
    throw err;
  }
}
export async function checkHealth(): Promise<HealthStatus> {
  const start = performance.now();
  try {
    const data = await api<{ status: string; timestamp: string }>('/api/health');
    const latency = performance.now() - start;
    return {
      status: data.status === 'healthy' ? 'healthy' : 'unhealthy',
      latency,
      timestamp: data.timestamp
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: 0,
      timestamp: new Date().toISOString()
    };
  }
}