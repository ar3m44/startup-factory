import Link from 'next/link';
import { Breadcrumbs } from './Breadcrumbs';
import { StatusBadge, getTaskStatusVariant, getCIStatusVariant } from './StatusBadge';
import type { FixtureTask } from '@/lib/fixtures/factory-fixtures';

interface TaskDetailProps {
  task: FixtureTask;
  taskContent?: string;
  reportContent?: string;
}

export function TaskDetail({ task, taskContent, reportContent }: TaskDetailProps) {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Factory', href: '/factory' },
          { label: 'Tasks', href: '/factory/tasks' },
          { label: task.id }
        ]}
      />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-neutral-500">{task.id}</span>
          <StatusBadge
            label={task.status.replace('_', ' ')}
            variant={getTaskStatusVariant(task.status)}
          />
          <span className={`text-sm font-medium ${
            task.priority === 'P0' ? 'text-red-600' :
            task.priority === 'P1' ? 'text-yellow-600' : 'text-neutral-500'
          }`}>
            {task.priority}
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          {task.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task File */}
          <section className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Task Description</h2>
            {taskContent ? (
              <div className="prose prose-sm prose-neutral max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-neutral-600 font-mono bg-neutral-50 p-4 rounded-lg overflow-auto">
                  {taskContent}
                </pre>
              </div>
            ) : (
              <p className="text-neutral-500 text-sm">
                Task file not found at factory/tasks/{task.id}.md
              </p>
            )}
          </section>

          {/* Report */}
          {reportContent && (
            <section className="bg-white border border-neutral-200 rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Report</h2>
              <div className="prose prose-sm prose-neutral max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-neutral-600 font-mono bg-neutral-50 p-4 rounded-lg overflow-auto">
                  {reportContent}
                </pre>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info */}
          <section className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <StatusBadge
                  label={task.status.replace('_', ' ')}
                  variant={getTaskStatusVariant(task.status)}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Priority</span>
                <span className="font-medium">{task.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">CI Status</span>
                {task.ciStatus ? (
                  <StatusBadge
                    label={task.ciStatus}
                    variant={getCIStatusVariant(task.ciStatus)}
                  />
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Updated</span>
                <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </section>

          {/* Links */}
          <section className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Links</h2>
            <div className="space-y-2">
              {task.prUrl ? (
                <a
                  href={task.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2 px-4 bg-neutral-900 text-white rounded-lg
                           hover:bg-neutral-800 transition-colors text-sm"
                >
                  View Pull Request →
                </a>
              ) : (
                <span className="block text-center py-2 px-4 bg-neutral-100 text-neutral-400 rounded-lg text-sm">
                  No PR yet
                </span>
              )}
              <Link
                href={`/factory/ventures/${task.ventureId}`}
                className="block w-full text-center py-2 px-4 border border-neutral-200 text-neutral-700 rounded-lg
                         hover:bg-neutral-50 transition-colors text-sm"
              >
                View Venture
              </Link>
            </div>
          </section>

          {/* Files */}
          <section className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Files</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-neutral-600">
                <span>📄</span>
                <span className="font-mono">factory/tasks/{task.id}.md</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <span>📊</span>
                <span className="font-mono">factory/results/{task.id}-REPORT.md</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
