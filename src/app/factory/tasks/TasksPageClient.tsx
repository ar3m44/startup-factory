'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TasksList } from '@/components/ControlPanel/TasksList';
import { CreateTaskModal } from '@/components/ControlPanel/CreateTaskModal';
import type { FixtureTask } from '@/lib/fixtures/factory-fixtures';

interface TasksPageClientProps {
  initialTasks: FixtureTask[];
  ventures: { id: string; name: string }[];
}

export function TasksPageClient({ initialTasks, ventures }: TasksPageClientProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTask = useCallback(async (taskData: {
    ventureId: string;
    title: string;
    description: string;
    priority: 'P0' | 'P1' | 'P2';
    type: 'feature' | 'bug' | 'refactor' | 'docs';
  }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      const result = await response.json();
      if (result.success) {
        // Add the new task to the list
        setTasks(prev => [{
          id: result.task.id,
          title: result.task.title,
          status: result.task.status,
          priority: result.task.priority,
          ventureId: result.task.ventureId,
          prUrl: result.task.prUrl || null,
          ciStatus: result.task.ciStatus || null,
          updatedAt: result.task.updatedAt,
        }, ...prev]);
        router.refresh();
      } else {
        alert('Ошибка создания задачи: ' + result.error);
      }
    } catch (error) {
      console.error('Create task error:', error);
      alert('Ошибка создания задачи');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleRunEngineer = useCallback(async (taskId: string) => {
    try {
      const response = await fetch('/api/engineer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      const result = await response.json();
      if (result.success) {
        // Update task status in the list
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: 'in_progress' as const } : t
        ));
        alert(`Engineer запущен для задачи ${taskId}.\n\n${result.note}`);
        router.refresh();
      } else {
        alert('Ошибка запуска: ' + result.error);
      }
    } catch (error) {
      console.error('Run engineer error:', error);
      alert('Ошибка запуска Engineer');
    }
  }, [router]);

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Задачи</h1>
            <p className="text-neutral-500">Инженерные задачи, выполняемые Factory OS</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Создать задачу
          </button>
        </div>
      </div>

      <TasksList tasks={tasks} onRunEngineer={handleRunEngineer} />

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTask}
        ventures={ventures}
      />
    </>
  );
}
