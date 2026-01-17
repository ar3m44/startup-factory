// ============================================================================
// API ROUTE: /api/scout - Запуск Scout агента
// ============================================================================

import { NextResponse } from 'next/server';
import { Orchestrator } from '@/lib/orchestrator';

/**
 * POST /api/scout
 * Запускает Scout агента для поиска сигналов рынка
 */
export async function POST() {
  try {
    const orchestrator = new Orchestrator();

    // Запустить Scout агента
    const signals = await orchestrator.runScout();

    return NextResponse.json({
      success: true,
      count: signals.length,
      signals: signals.map((s) => ({
        id: s.id,
        date: s.date,
        source: s.source,
        confidenceScore: s.confidenceScore,
        problem: s.problem,
        price: s.price,
        track: s.track,
        status: s.status,
      })),
    });
  } catch (error) {
    console.error('Scout API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scout
 * Получить статус последнего запуска Scout
 */
export async function GET() {
  try {
    const orchestrator = new Orchestrator();
    const state = await orchestrator.loadState();

    return NextResponse.json({
      success: true,
      lastRun: state.lastScoutRun,
      signalsCount: state.signals.length,
      signals: state.signals.map((s) => ({
        id: s.id,
        date: s.date,
        source: s.source,
        confidenceScore: s.confidenceScore,
        problem: s.problem.substring(0, 100) + '...',
        price: s.price,
        track: s.track,
        status: s.status,
      })),
    });
  } catch (error) {
    console.error('Scout GET API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
