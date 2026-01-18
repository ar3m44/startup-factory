// ============================================================================
// API ROUTE: /api/tasks - Управление задачами
// ============================================================================

import { NextResponse } from 'next/server';
import { getAllTasks, createTask, updateTask, getTaskById } from '@/lib/db';

/**
 * GET /api/tasks
 * Получить все задачи
 */
export async function GET() {
  try {
    const tasks = getAllTasks();
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error('Tasks API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Создать новую задачу
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ventureId, title, description, priority, type } = body;

    if (!ventureId || !title || !priority) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: ventureId, title, priority' },
        { status: 400 }
      );
    }

    // Generate task ID
    const tasks = getAllTasks();
    const maxId = tasks.reduce((max, t) => {
      const num = parseInt(t.id.replace('TASK-', ''));
      return num > max ? num : max;
    }, 0);
    const taskId = `TASK-${String(maxId + 1).padStart(4, '0')}`;

    const now = new Date().toISOString();
    const newTask = createTask({
      id: taskId,
      ventureId,
      title,
      description: description || '',
      priority,
      status: 'pending',
      type: type || 'feature',
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks
 * Обновить задачу
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing task id' },
        { status: 400 }
      );
    }

    const existing = getTaskById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    updateTask(id, updates);
    const updated = getTaskById(id);

    return NextResponse.json({ success: true, task: updated });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
