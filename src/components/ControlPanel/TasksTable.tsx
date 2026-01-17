// ============================================================================
// TasksTable - Read-only table of tasks with PR links and CI status
// TODO: Replace fixture data with real data from factory/tasks/*.md + GitHub API
// ============================================================================

import { Badge } from '@/components/UI/Badge';
import type { FixtureTask } from '@/lib/fixtures/factory-fixtures';

interface TasksTableProps {
  tasks: FixtureTask[];
}

export function TasksTable({ tasks }: TasksTableProps) {
  const getStatusVariant = (status: FixtureTask['status']) => {
    switch (status) {
      case 'done':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getCIStatusVariant = (ciStatus: FixtureTask['ciStatus']) => {
    switch (ciStatus) {
      case 'success':
        return 'success';
      case 'failure':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityVariant = (priority: FixtureTask['priority']) => {
    switch (priority) {
      case 'P0':
        return 'error';
      case 'P1':
        return 'warning';
      case 'P2':
        return 'info';
      default:
        return 'default';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No tasks yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Tasks will appear when created by Orchestrator
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                Task ID
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                Title
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                Priority
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                PR
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                CI
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <code className="text-sm font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                    {task.id}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-900">{task.title}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getPriorityVariant(task.priority)} size="sm">
                    {task.priority}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getStatusVariant(task.status)} size="sm">
                    {task.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {task.prUrl ? (
                    <a
                      href={task.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z" />
                      </svg>
                      PR
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {task.ciStatus ? (
                    <Badge variant={getCIStatusVariant(task.ciStatus)} size="sm">
                      {task.ciStatus === 'success' && (
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                        </svg>
                      )}
                      {task.ciStatus === 'failure' && (
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
                        </svg>
                      )}
                      {task.ciStatus}
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
