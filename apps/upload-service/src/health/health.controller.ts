import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';
import {
  ServiceHealthData,
  HealthCheckChainResponse,
} from '@interview-buddy/shared-types';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('check')
  async check(): Promise<HealthCheckChainResponse> {
    const startTime = Date.now();
    const correlationId = `health-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Perform operation (get timestamp with timezone info)
      const timestampData = this.healthService.getCurrentTimestamp();

      const latencyMs = Date.now() - startTime;

      const uploadServiceData: ServiceHealthData = {
        serviceName: 'upload-service',
        timestamp: Date.now(),
        operation: 'get_timestamp',
        result: timestampData,
        latencyMs,
      };

      // Forward to processor-service
      const processorResponse = await this.healthService.forwardToProcessor({
        timestamp: startTime,
        correlationId,
        uploadServiceData,
      });

      return processorResponse;
    } catch (error) {
      throw new HttpException(
        `Upload service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
