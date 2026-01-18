'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { SearchFilter } from './SearchFilter';
import { EmptyState } from './EmptyState';
import { StatusBadge, getVentureStatusVariant } from './StatusBadge';
import type { Venture } from '@/lib/types';

interface VenturesListProps {
  ventures: Venture[];
}

const statusLabels: Record<string, string> = {
  active: 'Активен',
  building: 'В разработке',
  launched: 'Запущен',
  killed: 'Закрыт',
  validating: 'Проверка',
};

export function VenturesList({ ventures }: VenturesListProps) {
  const [filteredVentures, setFilteredVentures] = useState(ventures);

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredVentures(ventures);
      return;
    }
    const lower = query.toLowerCase();
    setFilteredVentures(
      ventures.filter(v =>
        v.name.toLowerCase().includes(lower) ||
        v.id.toLowerCase().includes(lower) ||
        v.status.toLowerCase().includes(lower)
      )
    );
  }, [ventures]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SearchFilter
          placeholder="Поиск проектов..."
          onSearch={handleSearch}
        />
        <span className="text-sm text-neutral-500">
          {filteredVentures.length} {filteredVentures.length === 1 ? 'проект' : 'проектов'}
        </span>
      </div>

      {filteredVentures.length === 0 ? (
        <EmptyState
          title="Проекты не найдены"
          description="Попробуйте изменить поисковый запрос"
          icon="🚀"
        />
      ) : (
        <div className="space-y-3">
          {filteredVentures.map((venture) => (
            <Link
              key={venture.id}
              href={`/factory/ventures/${venture.id}`}
              className="block bg-white border border-neutral-200 rounded-2xl p-5
                       hover:border-neutral-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-neutral-900 truncate">
                      {venture.name}
                    </h3>
                    <StatusBadge
                      label={statusLabels[venture.status] || venture.status}
                      variant={getVentureStatusVariant(venture.status)}
                    />
                    <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full font-medium">
                      {venture.track}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 truncate">
                    {venture.blueprint?.tagline || venture.slug}
                  </p>
                </div>
                <div className="text-right ml-6 flex-shrink-0">
                  <div className="text-lg font-semibold text-neutral-900">
                    {(venture.metrics?.mrr || 0).toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-xs text-neutral-500">MRR</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-6 text-xs text-neutral-500">
                <span className="font-mono">{venture.id}</span>
                <span>Создан: {new Date(venture.createdAt).toLocaleDateString('ru-RU')}</span>
                {venture.metrics?.totalUsers !== undefined && venture.metrics.totalUsers > 0 && (
                  <span>{venture.metrics.totalUsers} пользователей</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
