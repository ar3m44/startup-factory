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
          placeholder="Search ventures..."
          onSearch={handleSearch}
        />
        <span className="text-sm text-neutral-500">
          {filteredVentures.length} venture{filteredVentures.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filteredVentures.length === 0 ? (
        <EmptyState
          title="No ventures found"
          description="Try adjusting your search or create a new venture"
          icon="🚀"
        />
      ) : (
        <div className="space-y-3">
          {filteredVentures.map((venture) => (
            <Link
              key={venture.id}
              href={`/factory/ventures/${venture.id}`}
              className="block p-4 bg-white border border-neutral-200 rounded-lg
                       hover:border-neutral-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-neutral-900 truncate">
                      {venture.name}
                    </h3>
                    <StatusBadge
                      label={venture.status}
                      variant={getVentureStatusVariant(venture.status)}
                    />
                    <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                      {venture.track}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 truncate">
                    {venture.blueprint?.tagline || venture.slug}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-medium text-neutral-900">
                    {venture.metrics?.mrr?.toLocaleString() || 0} RUB
                  </div>
                  <div className="text-xs text-neutral-500">MRR</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
                <span>ID: {venture.id}</span>
                <span>Created: {new Date(venture.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
