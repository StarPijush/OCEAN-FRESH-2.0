export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  error?: string;
  lastChecked: number;
}

export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  error?: string;
}

export interface HealthReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheckResult[];
  timestamp: number;
}

export interface HealthCheck {
  name: string;
  check(): Promise<HealthStatus>;
}
