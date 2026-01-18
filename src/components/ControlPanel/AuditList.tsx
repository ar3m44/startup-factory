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
          placeholder="Search audit log..."
          onSearch={handleSearch}
        />
        <span className="text-sm text-neutral-500">
          {filteredEntries.length} entr{filteredEntries.length !== 1 ? 'ies' : 'y'}
        </span>
      </div>

      {filteredEntries.length === 0 ? (
        <EmptyState
          title="No audit entries found"
          description="Try adjusting your search"
          icon="📋"
        />
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <Link
              key={entry.id}
              href={`/factory/audit/${entry.id}`}
              className="block p-4 bg-white border border-neutral-200 rounded-lg
                       hover:border-neutral-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-xl">{actorIcons[entry.actor] || '🔹'}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-neutral-900">{entry.actor}</span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-600">{entry.action.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-sm text-neutral-500 font-mono">
                      Result: {entry.result}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-neutral-500">
                  <div>{new Date(entry.timestamp).toLocaleDateString()}</div>
                  <div>{new Date(entry.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
              {entry.ventureId && (
                <div className="mt-2 text-xs text-neutral-500">
                  Venture: {entry.ventureId}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
