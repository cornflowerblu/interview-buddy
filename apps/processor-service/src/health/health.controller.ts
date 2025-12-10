import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HealthService } from './health.service';
import {
  ProcessorHealthRequest,
  ServiceHealthData,
} from '@interview-buddy/shared-types';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Post('process')
  async process(@Body() request: ProcessorHealthRequest) {
    const startTime = Date.now();

    try {
      // Call external API
      const zenMessage = await this.healthService.fetchGitHubZen();

      const latencyMs = Date.now() - startTime;

      const processorData: ServiceHealthData = {
        serviceName: 'processor-service',
        timestamp: Date.now(),
        operation: 'fetch_github_zen',
        result: zenMessage,
        latencyMs,
      };

      // Forward to ai-analyzer-service
      const analyzerResponse = await this.healthService.forwardToAnalyzer({
        timestamp: request.timestamp,
        correlationId: request.correlationId,
        uploadServiceData: request.uploadServiceData,
        processorServiceData: processorData,
      });

      return analyzerResponse;
    } catch (error) {
      throw new HttpException(
        `Processor service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
