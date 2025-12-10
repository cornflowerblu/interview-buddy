import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const UPLOAD_SERVICE_URL =
  process.env.UPLOAD_SERVICE_URL ||
  'http://upload-service.dev.svc.cluster.local:3000';

export async function GET() {
  try {
    const startTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const response = await fetch(`${UPLOAD_SERVICE_URL}/health/check`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Upload service returned ${response.status}`);
      }

      const data = await response.json();
      const totalLatency = Date.now() - startTime;

      return NextResponse.json({
        ...data,
        gatewayLatencyMs: totalLatency,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      },
      { status: 500 },
    );
  }
}
