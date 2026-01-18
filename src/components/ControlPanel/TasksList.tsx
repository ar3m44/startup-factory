'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { SearchFilter } from './SearchFilter';
import { EmptyState } from './EmptyState';
import { StatusBadge, getTaskStatusVariant, getCIStatusVariant } from './StatusBadge';
import type { FixtureTask } from '@/lib/fixtures/factory-fixtures';

interface TasksListProps {
  tasks: FixtureTask[];
}

export function TasksList({ tasks }: TasksListProps) {
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
          placeholder="Search tasks..."
          onSearch={handleSearch}
        />
        <span className="text-sm text-neutral-500">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="Try adjusting your search"
          icon="📋"
        />
      ) : (
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Task</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">CI</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/factory/tasks/${task.id}`}
                      className="block"
                    >
                      <span className="font-mono text-sm text-neutral-500">{task.id}</span>
                      <span className="block text-neutral-900 hover:text-blue-600">{task.title}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={task.status.replace('_', ' ')}
                      variant={getTaskStatusVariant(task.status)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${
                      task.priority === 'P0' ? 'text-red-600' :
                      task.priority === 'P1' ? 'text-yellow-600' : 'text-neutral-500'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {task.ciStatus ? (
                      <StatusBadge
                        label={task.ciStatus}
                        variant={getCIStatusVariant(task.ciStatus)}
                      />
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-500">
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
