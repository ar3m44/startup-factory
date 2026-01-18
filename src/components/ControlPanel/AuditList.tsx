'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { SearchFilter } from './SearchFilter';
import { EmptyState } from './EmptyState';
import type { FixtureAuditEntry } from '@/lib/fixtures/factory-fixtures';

interface AuditListProps {
  entries: FixtureAuditEntry[];
}

const actorIcons: Record<string, string> = {
  Scout: '🔍',
  Validator: '✅',
  Orchestrator: '🎯',
  Launcher: '🚀',
  Monitor: '📊',
  User: '👤',
};

const actorLabels: Record<string, string> = {
  Scout: 'Скаут',
  Validator: 'Валидатор',
  Orchestrator: 'Оркестратор',
  Launcher: 'Лаунчер',
  Monitor: 'Монитор',
  User: 'Пользователь',
};

const actionLabels: Record<string, string> = {
  validation_completed: 'Валидация завершена',
  signal_found: 'Сигнал найден',
  system_startup: 'Запуск системы',
  task_created: 'Задача создана',
  config_updated: 'Конфигурация обновлена',
  venture_launched: 'Проект запущен',
  error_occurred: 'Произошла ошибка',
};

export function AuditList({ entries }: AuditListProps) {
  const [filteredEntries, setFilteredEntries] = useState(entries);

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredEntries(entries);
      return;
    }
    const lower = query.toLowerCase();
    setFilteredEntries(
      entries.filter(e =>
        e.id.toLowerCase().includes(lower) ||
        e.actor.toLowerCase().includes(lower) ||
        e.action.toLowerCase().includes(lower) ||
        e.result.toLowerCase().includes(lower)
      )
    );
  }, [entries]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SearchFilter
          placeholder="Поиск в журнале..."
          onSearch={handleSearch}
        />
        <span className="text-sm text-neutral-500">
          {filteredEntries.length} {filteredEntries.length === 1 ? 'запись' : 'записей'}
        </span>
      </div>

      {filteredEntries.length === 0 ? (
        <EmptyState
          title="Записи не найдены"
          description="Попробуйте изменить поисковый запрос"
          icon="📋"
        />
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-neutral-200" />

          <div className="space-y-4">
            {filteredEntries.map((entry, index) => (
              <Link
                key={entry.id}
                href={`/factory/audit/${entry.id}`}
                className="block relative pl-14"
              >
                {/* Timeline dot */}
                <div className="absolute left-4 top-5 w-5 h-5 rounded-full bg-white border-2 border-neutral-300 flex items-center justify-center text-xs z-10">
                  {actorIcons[entry.actor] || '🔹'}
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-300 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-neutral-900">
                          {actorLabels[entry.actor] || entry.actor}
                        </span>
                        <span className="text-neutral-300">·</span>
                        <span className="text-neutral-600">
                          {actionLabels[entry.action] || entry.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 font-mono bg-neutral-50 px-2 py-1 rounded inline-block">
                        {entry.result}
                      </p>
                    </div>
                    <div className="text-right text-sm text-neutral-400 ml-4 flex-shrink-0">
                      <div className="font-medium">{new Date(entry.timestamp).toLocaleDateString('ru-RU')}</div>
                      <div>{new Date(entry.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  {entry.ventureId && (
                    <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                      Проект: <span className="font-mono">{entry.ventureId}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
