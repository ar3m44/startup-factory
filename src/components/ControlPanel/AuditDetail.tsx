import Link from 'next/link';
import { Breadcrumbs } from './Breadcrumbs';
import type { FixtureAuditEntry } from '@/lib/fixtures/factory-fixtures';

interface AuditDetailProps {
  entry: FixtureAuditEntry;
}

const actorIcons: Record<string, string> = {
  Scout: '🔍',
  Validator: '✅',
  Orchestrator: '🎯',
  Launcher: '🚀',
  Monitor: '📊',
  User: '👤',
};

const actorDescriptions: Record<string, string> = {
  Scout: 'AI agent that discovers market opportunities and signals',
  Validator: 'AI agent that validates business ideas and creates blueprints',
  Orchestrator: 'Core system that coordinates all Factory operations',
  Launcher: 'AI agent that deploys and launches ventures',
  Monitor: 'AI agent that tracks venture performance and metrics',
  User: 'Human operator or administrator',
};

export function AuditDetail({ entry }: AuditDetailProps) {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Factory', href: '/factory' },
          { label: 'Audit', href: '/factory/audit' },
          { label: entry.id }
        ]}
      />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{actorIcons[entry.actor] || '🔹'}</span>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              {entry.actor}
            </h1>
            <p className="text-neutral-500">
              {entry.action.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <section className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Event Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-1">Action</h3>
                <p className="text-neutral-900">{entry.action.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-1">Result</h3>
                <p className="font-mono text-neutral-900 bg-neutral-50 px-3 py-2 rounded">
                  {entry.result}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-1">Timestamp</h3>
                <p className="text-neutral-900">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </section>

          {/* Actor Info */}
          <section className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">About {entry.actor}</h2>
            <p className="text-neutral-600">
              {actorDescriptions[entry.actor] || 'No description available'}
            </p>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info */}
          <section className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Entry ID</span>
                <span className="font-mono text-xs">{entry.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Actor</span>
                <span>{entry.actor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Date</span>
                <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Time</span>
                <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </section>

          {/* Related Venture */}
          {entry.ventureId && (
            <section className="bg-white border border-neutral-200 rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Related Venture</h2>
              <Link
                href={`/factory/ventures/${entry.ventureId}`}
                className="block w-full text-center py-2 px-4 bg-neutral-900 text-white rounded-lg
                         hover:bg-neutral-800 transition-colors text-sm"
              >
                View Venture →
              </Link>
              <p className="mt-2 text-xs text-neutral-500 text-center font-mono">
                {entry.ventureId}
              </p>
            </section>
          )}

          {/* Navigation */}
          <section className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Navigation</h2>
            <Link
              href="/factory/audit"
              className="block w-full text-center py-2 px-4 border border-neutral-200 text-neutral-700 rounded-lg
                       hover:bg-neutral-50 transition-colors text-sm"
            >
              ← Back to Audit Log
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
