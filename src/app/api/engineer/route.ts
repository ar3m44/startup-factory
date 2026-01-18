// ============================================================================
// API ROUTE: /api/engineer - Запуск Engineer агента
// ============================================================================

import { NextResponse } from 'next/server';
import { getTaskById, updateTask, createAuditEntry } from '@/lib/db';

/**
 * POST /api/engineer
 * Запустить Engineer агента для выполнения задачи
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Missing taskId' },
        { status: 400 }
      );
    }

    const task = getTaskById(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if task is already in progress
    if (task.status === 'in_progress') {
      return NextResponse.json(
        { success: false, error: 'Task is already in progress' },
        { status: 400 }
      );
    }

    // Update task status
    const now = new Date().toISOString();
    updateTask(taskId, {
      status: 'in_progress',
      startedAt: now,
    });

    // Create audit entry
    createAuditEntry({
      id: `AUDIT-${now.replace(/:/g, '-').split('.')[0]}`,
      timestamp: now,
      ventureId: task.ventureId,
      actor: 'Engineer',
      action: 'task_started',
      result: taskId,
      data: { taskId, title: task.title },
    });

    // In production, this would trigger GitHub Actions workflow
    // For now, we just update the status and return success
    const workflowUrl = `https://github.com/ar3m44/startup-factory/actions/workflows/engineer.yml`;

    return NextResponse.json({
      success: true,
      message: 'Engineer agent triggered',
      taskId,
      workflowUrl,
      note: 'Для автоматического запуска через GitHub Actions, запустите workflow вручную или настройте триггер',
    });
  } catch (error) {
    console.error('Engineer API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
