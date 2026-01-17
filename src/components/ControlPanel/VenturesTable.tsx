// ============================================================================
// VenturesTable - Read-only table of ventures
// TODO: Replace fixture data with real data from /api/state
// ============================================================================

import { Badge } from '@/components/UI/Badge';
import type { Venture } from '@/lib/types';

interface VenturesTableProps {
  ventures: Venture[];
}

export function VenturesTable({ ventures }: VenturesTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusVariant = (status: Venture['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'killed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTrackVariant = (track: Venture['track']) => {
    return track === 'FAST' ? 'info' : 'default';
  };

  if (ventures.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No ventures yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Validated signals with GO decision will appear here
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
                Venture ID
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                Name
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                Track
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                URL
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ventures.map((venture) => (
              <tr key={venture.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <code className="text-sm font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                    {venture.id}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">
                    {venture.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getTrackVariant(venture.track)} size="sm">
                    {venture.track}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getStatusVariant(venture.status)} size="sm">
                    {venture.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {venture.url ? (
                    <a
                      href={venture.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {venture.url}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-500">
                    {formatDate(venture.createdAt)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
