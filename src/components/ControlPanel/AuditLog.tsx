// ============================================================================
// AuditLog - Read-only list of last 10 audit entries
// TODO: Replace fixture data with real data from factory/audit/*.md
// ============================================================================

import { Badge } from '@/components/UI/Badge';
import type { FixtureAuditEntry } from '@/lib/fixtures/factory-fixtures';

interface AuditLogProps {
  entries: FixtureAuditEntry[];
  limit?: number;
}

export function AuditLog({ entries, limit = 10 }: AuditLogProps) {
  const displayEntries = entries.slice(0, limit);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActorVariant = (actor: FixtureAuditEntry['actor']) => {
    switch (actor) {
      case 'Scout':
        return 'info';
      case 'Validator':
        return 'warning';
      case 'Orchestrator':
        return 'default';
      case 'Launcher':
        return 'success';
      case 'Monitor':
        return 'error';
      case 'User':
        return 'default';
      default:
        return 'default';
    }
  };

  const getResultVariant = (result: string) => {
    if (result === 'GO' || result === 'OK' || result.includes('success')) {
      return 'success';
    }
    if (result === 'NO-GO' || result.includes('fail')) {
      return 'error';
    }
    return 'default';
  };

  if (displayEntries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No audit entries yet</p>
        <p className="text-sm text-gray-400 mt-1">
          System actions will be logged here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <ul className="divide-y divide-gray-100">
        {displayEntries.map((entry) => (
          <li
            key={entry.id}
            className="px-4 py-3 hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getActorVariant(entry.actor)} size="sm">
                    {entry.actor}
                  </Badge>
                  <span className="text-sm text-gray-900">
                    {entry.action.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatTimestamp(entry.timestamp)}</span>
                  {entry.ventureId && (
                    <>
                      <span>•</span>
                      <code className="bg-gray-100 px-1 rounded">
                        {entry.ventureId}
                      </code>
                    </>
                  )}
                </div>
              </div>
              <Badge variant={getResultVariant(entry.result)} size="sm">
                {entry.result}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
      {entries.length > limit && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
          <span className="text-xs text-gray-500">
            Showing {limit} of {entries.length} entries
          </span>
        </div>
      )}
    </div>
  );
}
