// ============================================================================
// API ROUTE: /api/engineer-runs - Get Engineer runs history
// ============================================================================

import { NextResponse } from 'next/server';
import { getRecentEngineerRuns } from '@/lib/db';

/**
 * GET /api/engineer-runs
 * Get recent engineer runs
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const runs = getRecentEngineerRuns(limit);

    return NextResponse.json({
      success: true,
      runs,
      total: runs.length,
    });
  } catch (error) {
    console.error('Engineer runs API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
