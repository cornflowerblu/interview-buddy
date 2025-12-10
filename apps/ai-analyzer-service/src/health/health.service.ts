import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  /**
   * Calculate Fibonacci number recursively
   * Used for demonstrating computation in health check
   */
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}
