import Link from 'next/link';
import { Breadcrumbs } from './Breadcrumbs';
import type { DbAuditEntry } from '@/lib/db';

interface AuditDetailProps {
  entry: DbAuditEntry;
}

const actorIcons: Record<string, string> = {
  Scout: '🔍',
  Validator: '✅',
  Orchestrator: '🎯',
  Launcher: '🚀',
  Monitor: '📊',
  User: '👤',
  Engineer: '🤖',
};

const actorLabels: Record<string, string> = {
  Scout: 'Скаут',
  Validator: 'Валидатор',
  Orchestrator: 'Оркестратор',
  Launcher: 'Лаунчер',
  Monitor: 'Монитор',
  User: 'Пользователь',
  Engineer: 'Инженер',
};

const actorDescriptions: Record<string, string> = {
  Scout: 'AI агент, который ищет рыночные возможности и сигналы на платформах (Reddit, HackerNews, Twitter и др.)',
  Validator: 'AI агент, который проверяет бизнес-идеи по 5 пайплайнам и создаёт blueprints для запуска',
  Orchestrator: 'Ядро системы, координирующее все операции Factory OS и управляющее агентами',
  Launcher: 'AI агент, который деплоит и запускает проекты в production',
  Monitor: 'AI агент, который отслеживает метрики, производительность и kill-критерии проектов',
  User: 'Человек-оператор или администратор системы',
  Engineer: 'AI агент (Claude) для автономного написания и тестирования кода',
};

const actionLabels: Record<string, string> = {
  signal_found: 'Найден сигнал',
  validation_completed: 'Валидация завершена',
  venture_launched: 'Проект запущен',
  venture_killed: 'Проект закрыт',
  task_created: 'Задача создана',
  task_started: 'Задача начата',
  task_completed: 'Задача завершена',
  system_startup: 'Система запущена',
  config_updated: 'Конфигурация обновлена',
};

export function AuditDetail({ entry }: AuditDetailProps) {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/factory' },
          { label: 'Журнал', href: '/factory/audit' },
          { label: entry.id }
        ]}
      />

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-50 flex items-center justify-center text-3xl shadow-sm">
            {actorIcons[entry.actor] || '🔹'}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              {actorLabels[entry.actor] || entry.actor}
            </h1>
            <p className="text-neutral-500">
              {actionLabels[entry.action] || entry.action.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <section className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h2 className="text-lg font-medium mb-4">Детали события</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-1">Действие</h3>
                <p className="text-neutral-900">{actionLabels[entry.action] || entry.action.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-1">Результат</h3>
                <p className="font-mono text-neutral-900 bg-neutral-50 px-4 py-3 rounded-xl">
                  {entry.result || '—'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-1">Время</h3>
                <p className="text-neutral-900">
                  {new Date(entry.timestamp).toLocaleString('ru-RU')}
                </p>
              </div>
            </div>
          </section>

          {/* Actor Info */}
          <section className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h2 className="text-lg font-medium mb-4">Об агенте {actorLabels[entry.actor] || entry.actor}</h2>
            <p className="text-neutral-600">
              {actorDescriptions[entry.actor] || 'Описание недоступно'}
            </p>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info */}
          <section className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h2 className="text-lg font-medium mb-4">Информация</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">ID записи</span>
                <span className="font-mono text-xs bg-neutral-100 px-2 py-1 rounded">{entry.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Агент</span>
                <span>{actorLabels[entry.actor] || entry.actor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Дата</span>
                <span>{new Date(entry.timestamp).toLocaleDateString('ru-RU')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Время</span>
                <span>{new Date(entry.timestamp).toLocaleTimeString('ru-RU')}</span>
              </div>
            </div>
          </section>

          {/* Related Venture */}
          {entry.ventureId && (
            <section className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h2 className="text-lg font-medium mb-4">Связанный проект</h2>
              <Link
                href={`/factory/ventures/${entry.ventureId}`}
                className="block w-full text-center py-2.5 px-4 bg-neutral-900 text-white rounded-xl
                         hover:bg-neutral-800 transition-colors text-sm font-medium"
              >
                К проекту →
              </Link>
              <p className="mt-2 text-xs text-neutral-500 text-center font-mono">
                {entry.ventureId}
              </p>
            </section>
          )}

          {/* Navigation */}
          <section className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h2 className="text-lg font-medium mb-4">Навигация</h2>
            <Link
              href="/factory/audit"
              className="block w-full text-center py-2.5 px-4 border border-neutral-200 text-neutral-700 rounded-xl
                       hover:bg-neutral-50 transition-colors text-sm font-medium"
            >
              ← Назад к журналу
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
