// ============================================================================
// API ROUTE: /api/monitor - Запуск Monitor агента
// ============================================================================

import { NextResponse } from 'next/server';
import { Orchestrator } from '@/lib/orchestrator';

/**
 * POST /api/monitor
 * Запустить Monitor агента для анализа всех ventures
 */
export async function POST() {
  try {
    const orchestrator = new Orchestrator();
    const reports = await orchestrator.monitorVentures();

    // Calculate summary
    const summary = {
      total: reports.length,
      healthy: reports.filter(r => r.recommendation === 'CONTINUE').length,
      warning: reports.filter(r => r.recommendation === 'WARNING').length,
      pivot: reports.filter(r => r.recommendation === 'PIVOT').length,
      kill: reports.filter(r => r.recommendation === 'KILL').length,
      totalMRR: reports.reduce((sum, r) => sum + r.metrics.mrr, 0),
      totalRevenue: reports.reduce((sum, r) => sum + r.metrics.revenue, 0),
    };

    // Get ventures needing attention
    const needsAttention = reports
      .filter(r => r.recommendation !== 'CONTINUE')
      .map(r => ({
        ventureId: r.ventureId,
        recommendation: r.recommendation,
        reasoning: r.reasoning,
        actionItems: r.actionItems,
      }));

    return NextResponse.json({
      success: true,
      summary,
      needsAttention,
      reports,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Monitor API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/monitor
 * Получить последний статус мониторинга
 */
export async function GET() {
  try {
    const orchestrator = new Orchestrator();
    const state = await orchestrator.loadState();

    return NextResponse.json({
      success: true,
      lastMonitorRun: state.lastMonitorRun,
      activeVentures: state.ventures.filter(v => v.status === 'active' || v.status === 'launched').length,
      totalVentures: state.ventures.length,
    });
  } catch (error) {
    console.error('Monitor API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
