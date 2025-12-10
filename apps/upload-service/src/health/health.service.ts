import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  ProcessorHealthRequest,
  HealthCheckChainResponse,
} from '@interview-buddy/shared-types';

@Injectable()
export class HealthService {
  private readonly PROCESSOR_SERVICE_URL =
    process.env.PROCESSOR_SERVICE_URL ||
    'http://processor-service.dev.svc.cluster.local:3001';

  /**
   * Get current timestamp with timezone information
   */
  getCurrentTimestamp(): { iso: string; unix: number; timezone: string } {
    const now = new Date();
    return {
      iso: now.toISOString(),
      unix: now.getTime(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  /**
   * Forward health check request to Processor Service
   */
  async forwardToProcessor(
    request: ProcessorHealthRequest,
  ): Promise<HealthCheckChainResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        const response = await fetch(
          `${this.PROCESSOR_SERVICE_URL}/health/process`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Processor service returned ${response.status}`);
        }

        return await response.json();
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      throw new HttpException(
        `Failed to call processor-service: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
