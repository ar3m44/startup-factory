// ============================================================================
// API ROUTE: /api/validator - Запуск Validator агента
// ============================================================================

import { NextResponse } from 'next/server';
import { Orchestrator } from '@/lib/orchestrator';

/**
 * POST /api/validator
 * Валидирует сигнал через Validator агента
 *
 * Body: { signalId: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { signalId } = body;

    if (!signalId) {
      return NextResponse.json(
        {
          success: false,
          error: 'signalId is required',
        },
        { status: 400 }
      );
    }

    const orchestrator = new Orchestrator();

    // Запустить Validator агента
    const result = await orchestrator.runValidator(signalId);

    return NextResponse.json({
      success: true,
      validation: {
        id: result.id,
        signalId: result.signalId,
        date: result.date,
        decision: result.decision,
        pipelines: result.pipelines,
        blueprint: result.blueprint
          ? {
              name: result.blueprint.name,
              slug: result.blueprint.slug,
              tagline: result.blueprint.tagline,
              track: result.blueprint.metrics.track,
              targetMRR: result.blueprint.metrics.targetMRR,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Validator API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
