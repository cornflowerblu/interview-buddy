/**
 * Health Check Request/Response Types
 *
 * These types define the contract for E2E health checks across services
 */

export interface HealthCheckRequest {
  timestamp: number;
  correlationId: string;
}

export interface ServiceHealthData {
  serviceName: string;
  timestamp: number;
  operation: string;
  result: any;
  latencyMs: number;
}

export interface ProcessorHealthRequest extends HealthCheckRequest {
  uploadServiceData: ServiceHealthData;
}

export interface AnalyzerHealthRequest extends HealthCheckRequest {
  uploadServiceData: ServiceHealthData;
  processorServiceData: ServiceHealthData;
}

export interface HealthCheckChainResponse {
  success: boolean;
  correlationId: string;
  totalLatencyMs: number;
  services: ServiceHealthData[];
  timestamp: number;
}
