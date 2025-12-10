import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  AnalyzerHealthRequest,
  HealthCheckChainResponse,
} from '@interview-buddy/shared-types';

@Injectable()
export class HealthService {
  private readonly AI_ANALYZER_URL =
    process.env.AI_ANALYZER_SERVICE_URL ||
    'http://ai-analyzer-service.dev.svc.cluster.local:3002';

  /**
   * Fetch a random zen message from GitHub API
   * Demonstrates external HTTP call capability
   */
  async fetchGitHubZen(): Promise<string> {
    try {
      const response = await fetch('https://api.github.com/zen');
      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      throw new Error(
        `Failed to fetch GitHub Zen: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Forward health check request to AI Analyzer Service
   */
  async forwardToAnalyzer(
    request: AnalyzerHealthRequest,
  ): Promise<HealthCheckChainResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        const response = await fetch(`${this.AI_ANALYZER_URL}/health/compute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`AI Analyzer returned ${response.status}`);
        }

        return await response.json();
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      throw new HttpException(
        `Failed to call ai-analyzer-service: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
