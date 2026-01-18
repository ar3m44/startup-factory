import Link from 'next/link';
import { Breadcrumbs } from './Breadcrumbs';
import { StatusBadge, getTaskStatusVariant, getCIStatusVariant } from './StatusBadge';
import type { DbTask } from '@/lib/db';

interface TaskDetailProps {
  task: DbTask;
  taskContent?: string;
  reportContent?: string;
}

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  pending: 'Ожидание',
  in_progress: 'В работе',
  review: 'На проверке',
  done: 'Готово',
  failed: 'Ошибка',
};

const ciLabels: Record<string, string> = {
  pending: 'Ожидание',
  success: 'Успех',
  failure: 'Ошибка',
};

export function TaskDetail({ task, taskContent, reportContent }: TaskDetailProps) {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/factory' },
          { label: 'Задачи', href: '/factory/tasks' },
          { label: task.id }
        ]}
      />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-neutral-500 bg-neutral-100 px-2 py-1 rounded">{task.id}</span>
          <StatusBadge
            label={statusLabels[task.status] || task.status}
            variant={getTaskStatusVariant(task.status)}
          />
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
            task.priority === 'P0' ? 'bg-red-100 text-red-700' :
            task.priority === 'P1' ? 'bg-yellow-100 text-yellow-700' : 'bg-neutral-100 text-neutral-600'
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
          <section className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h2 className="text-lg font-medium mb-4">Описание задачи</h2>
            {taskContent ? (
              <div className="prose prose-sm prose-neutral max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-neutral-600 font-mono bg-neutral-50 p-4 rounded-xl overflow-auto">
                  {taskContent}
                </pre>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-400 text-sm">
                  Файл задачи не найден: factory/tasks/{task.id}.md
                </p>
              </div>
            )}
          </section>

          {/* Report */}
          {reportContent && (
            <section className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h2 className="text-lg font-medium mb-4">Отчёт</h2>
              <div className="prose prose-sm prose-neutral max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-neutral-600 font-mono bg-neutral-50 p-4 rounded-xl overflow-auto">
                  {reportContent}
                </pre>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info */}
          <section className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h2 className="text-lg font-medium mb-4">Информация</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Статус</span>
                <StatusBadge
                  label={statusLabels[task.status] || task.status}
                  variant={getTaskStatusVariant(task.status)}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Приоритет</span>
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  task.priority === 'P0' ? 'bg-red-100 text-red-700' :
                  task.priority === 'P1' ? 'bg-yellow-100 text-yellow-700' : 'bg-neutral-100 text-neutral-600'
                }`}>{task.priority}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">CI</span>
                {task.ciStatus ? (
                  <StatusBadge
                    label={ciLabels[task.ciStatus] || task.ciStatus}
                    variant={getCIStatusVariant(task.ciStatus)}
                  />
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Обновлено</span>
                <span>{new Date(task.updatedAt).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>
          </section>

          {/* Links */}
          <section className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h2 className="text-lg font-medium mb-4">Ссылки</h2>
            <div className="space-y-2">
              {task.prUrl ? (
                <a
                  href={task.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2.5 px-4 bg-neutral-900 text-white rounded-xl
                           hover:bg-neutral-800 transition-colors text-sm font-medium"
                >
                  Pull Request →
                </a>
              ) : (
                <span className="block text-center py-2.5 px-4 bg-neutral-100 text-neutral-400 rounded-xl text-sm">
                  PR ещё нет
                </span>
              )}
              <Link
                href={`/factory/ventures/${task.ventureId}`}
                className="block w-full text-center py-2.5 px-4 border border-neutral-200 text-neutral-700 rounded-xl
                         hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                К проекту
              </Link>
            </div>
          </section>

          {/* Files */}
          <section className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h2 className="text-lg font-medium mb-4">Файлы</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-neutral-600 p-2 bg-neutral-50 rounded-lg">
                <span>📄</span>
                <span className="font-mono text-xs">factory/tasks/{task.id}.md</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600 p-2 bg-neutral-50 rounded-lg">
                <span>📊</span>
                <span className="font-mono text-xs">factory/results/{task.id}-REPORT.md</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
