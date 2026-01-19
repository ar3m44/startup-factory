// ============================================================================
// API ROUTE: /api/analytics - Get analytics data
// ============================================================================

import { NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/analytics';

/**
 * GET /api/analytics
 * Get analytics summary
 */
export async function GET() {
  try {
    const analytics = getAnalytics();
    const summary = analytics.getSummary();

    return NextResponse.json({
      success: true,
      ...summary,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics
 * Track an analytics event
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, ventureId, data } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Event type is required' },
        { status: 400 }
      );
    }

    const analytics = getAnalytics();
    analytics.trackEvent(type, ventureId, data || {});

    return NextResponse.json({
      success: true,
      message: 'Event tracked',
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
