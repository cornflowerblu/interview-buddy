'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ServiceHealthData {
  serviceName: string;
  timestamp: number;
  operation: string;
  result: any;
  latencyMs: number;
}

interface HealthCheckResponse {
  success: boolean;
  correlationId: string;
  totalLatencyMs: number;
  services: ServiceHealthData[];
  timestamp: number;
  gatewayLatencyMs?: number;
  error?: string;
}

export default function Home() {
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runHealthCheck = async () => {
    setLoading(true);
    setError(null);
    setHealthData(null);

    try {
      const response = await fetch('/api/health');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Health check failed');
      }

      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-between py-16 px-8 bg-white dark:bg-black">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={120}
          height={24}
          priority
        />

        <div className="flex flex-col items-center gap-8 text-center w-full">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            Interview Buddy
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            End-to-End Microservices Health Check
          </p>

          <button
            onClick={runHealthCheck}
            disabled={loading}
            className="flex h-14 w-64 items-center justify-center gap-2 rounded-full bg-black px-6 text-white transition-all hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? 'Running Check...' : 'Run Health Check'}
          </button>

          {error && (
            <div className="w-full max-w-2xl p-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
                Error
              </h3>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {healthData && healthData.success && (
            <div className="w-full max-w-2xl space-y-4">
              <div className="p-6 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-200">
                    Health Check Passed ✓
                  </h3>
                  <span className="text-sm text-green-700 dark:text-green-300">
                    {healthData.totalLatencyMs}ms total
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 font-mono">
                  Correlation ID: {healthData.correlationId}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
                  Service Chain Results
                </h3>

                {healthData.services.map((service, index) => (
                  <div
                    key={service.serviceName}
                    className="p-5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold">
                          {index + 1}
                        </span>
                        <h4 className="text-lg font-semibold text-black dark:text-zinc-50">
                          {service.serviceName}
                        </h4>
                      </div>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {service.latencyMs}ms
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-zinc-600 dark:text-zinc-400">
                          Operation:{' '}
                        </span>
                        <span className="font-mono text-black dark:text-zinc-50">
                          {service.operation}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-600 dark:text-zinc-400">
                          Result:{' '}
                        </span>
                        <pre className="mt-2 p-3 rounded bg-zinc-100 dark:bg-zinc-950 overflow-x-auto">
                          <code className="text-xs text-black dark:text-zinc-50">
                            {JSON.stringify(service.result, null, 2)}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-sm text-zinc-500 dark:text-zinc-600">
          Testing: Next.js → upload-service → processor-service →
          ai-analyzer-service
        </div>
      </main>
    </div>
  );
}
