// ============================================================================
// API ROUTE: /api/state - Получить состояние Factory
// ============================================================================

import { NextResponse } from 'next/server';
import { Orchestrator } from '@/lib/orchestrator';

/**
 * GET /api/state
 * Получить текущее состояние Factory OS
 */
export async function GET() {
  try {
    const orchestrator = new Orchestrator();
    const state = await orchestrator.loadState();

    return NextResponse.json({
      success: true,
      state: {
        ventures: state.ventures.map((v) => ({
          id: v.id,
          name: v.name,
          slug: v.slug,
          url: v.url,
          status: v.status,
          track: v.track,
          launchedAt: v.launchedAt,
          metrics: v.metrics,
        })),
        signals: state.signals.map((s) => ({
          id: s.id,
          date: s.date,
          source: s.source,
          confidenceScore: s.confidenceScore,
          problem: s.problem.substring(0, 150),
          status: s.status,
          validationId: s.validationId,
        })),
        lastScoutRun: state.lastScoutRun,
        lastValidatorRun: state.lastValidatorRun,
        lastMonitorRun: state.lastMonitorRun,
        budget: state.budget,
        stats: state.stats,
      },
    });
  } catch (error) {
    console.error('State API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
