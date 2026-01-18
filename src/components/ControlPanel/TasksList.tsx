'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { SearchFilter } from './SearchFilter';
import { EmptyState } from './EmptyState';
import { StatusBadge, getTaskStatusVariant, getCIStatusVariant } from './StatusBadge';
import type { FixtureTask } from '@/lib/fixtures/factory-fixtures';

interface TasksListProps {
  tasks: FixtureTask[];
  onRunEngineer?: (taskId: string) => void;
}

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  pending: 'Ожидание',
  in_progress: 'В работе',
  review: 'Проверка',
  done: 'Готово',
  failed: 'Ошибка',
};

const ciLabels: Record<string, string> = {
  pending: 'Ожидание',
  success: 'Успех',
  failure: 'Ошибка',
};

export function TasksList({ tasks, onRunEngineer }: TasksListProps) {
  const [filteredTasks, setFilteredTasks] = useState(tasks);

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredTasks(tasks);
      return;
    }
    const lower = query.toLowerCase();
    setFilteredTasks(
      tasks.filter(t =>
        t.id.toLowerCase().includes(lower) ||
        t.title.toLowerCase().includes(lower) ||
        t.status.toLowerCase().includes(lower) ||
        t.priority.toLowerCase().includes(lower)
      )
    );
  }, [tasks]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SearchFilter
          placeholder="Поиск задач..."
          onSearch={handleSearch}
        />
        <span className="text-sm text-neutral-500">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'задача' : 'задач'}
        </span>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          title="Задачи не найдены"
          description="Попробуйте изменить поисковый запрос"
          icon="📋"
        />
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-5 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Задача</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Статус</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Приоритет</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">CI</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Обновлено</th>
                {onRunEngineer && <th className="text-left px-5 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Действия</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-4">
                    <Link
                      href={`/factory/tasks/${task.id}`}
                      className="block group"
                    >
                      <span className="font-mono text-xs text-neutral-400">{task.id}</span>
                      <span className="block text-neutral-900 font-medium group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge
                      label={statusLabels[task.status] || task.status}
                      variant={getTaskStatusVariant(task.status)}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                      task.priority === 'P0' ? 'bg-red-100 text-red-700' :
                      task.priority === 'P1' ? 'bg-yellow-100 text-yellow-700' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {task.ciStatus ? (
                      <StatusBadge
                        label={ciLabels[task.ciStatus] || task.ciStatus}
                        variant={getCIStatusVariant(task.ciStatus)}
                      />
                    ) : (
                      <span className="text-neutral-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-neutral-500">
                    {new Date(task.updatedAt).toLocaleDateString('ru-RU')}
                  </td>
                  {onRunEngineer && (
                    <td className="px-5 py-4">
                      {(task.status === 'pending' || task.status === 'draft') ? (
                        <button
                          onClick={() => onRunEngineer(task.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          🤖 Запустить
                        </button>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
