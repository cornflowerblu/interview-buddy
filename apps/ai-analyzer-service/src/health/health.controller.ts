import { Controller, Post, Body } from '@nestjs/common';
import { HealthService } from './health.service';
import {
  AnalyzerHealthRequest,
  ServiceHealthData,
  HealthCheckChainResponse,
} from '@interview-buddy/shared-types';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Post('compute')
  async compute(
    @Body() request: AnalyzerHealthRequest,
  ): Promise<HealthCheckChainResponse> {
    const startTime = Date.now();

    // Perform computation (Fibonacci of 20)
    const fibResult = this.healthService.fibonacci(20);

    const latencyMs = Date.now() - startTime;

    const analyzerData: ServiceHealthData = {
      serviceName: 'ai-analyzer-service',
      timestamp: Date.now(),
      operation: 'fibonacci(20)',
      result: fibResult,
      latencyMs,
    };

    return {
      success: true,
      correlationId: request.correlationId,
      totalLatencyMs: Date.now() - request.timestamp,
      services: [
        request.uploadServiceData,
        request.processorServiceData,
        analyzerData,
      ],
      timestamp: Date.now(),
    };
  }
}
