// ============================================================================
// Factory Control Panel - Read-only dashboard
// Route: /factory/control
// ============================================================================
// TODO: Replace fixture data with real data sources:
// - Ventures: /api/state -> factory/state.json
// - Tasks: Parse factory/tasks/*.md files
// - Audit: Parse factory/audit/*.md files
// - Metrics: Aggregate from ventures + external analytics
// ============================================================================

import { Header } from '@/components/Dashboard/Header';
import { VenturesTable } from '@/components/ControlPanel/VenturesTable';
import { TasksTable } from '@/components/ControlPanel/TasksTable';
import { MetricsBlock } from '@/components/ControlPanel/MetricsBlock';
import { AuditLog } from '@/components/ControlPanel/AuditLog';
import {
  fixtureVentures,
  fixtureTasks,
  fixtureAuditEntries,
  fixtureMetrics,
} from '@/lib/fixtures/factory-fixtures';

export const metadata = {
  title: 'Control Panel | Factory OS',
  description: 'Read-only Factory Control Panel for monitoring ventures, tasks, and metrics',
};

export default function ControlPanelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Control Panel</h1>
          <p className="text-sm text-gray-500 mt-1">
            Read-only view of Factory OS state
          </p>
        </div>

        {/* Metrics Block */}
        <section className="mb-8">
          <MetricsBlock metrics={fixtureMetrics} />
        </section>

        {/* Ventures Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Ventures</h2>
            <span className="text-sm text-gray-500">
              {fixtureVentures.length} total
            </span>
          </div>
          <VenturesTable ventures={fixtureVentures} />
        </section>

        {/* Tasks Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
            <span className="text-sm text-gray-500">
              {fixtureTasks.length} total
            </span>
          </div>
          <TasksTable tasks={fixtureTasks} />
        </section>

        {/* Audit Log Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Audit Log</h2>
            <span className="text-sm text-gray-500">
              Last 10 entries
            </span>
          </div>
          <AuditLog entries={fixtureAuditEntries} limit={10} />
        </section>

        {/* Footer Note */}
        <footer className="text-center py-8 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Factory OS Control Panel v0.1 | Data is read-only fixture data
          </p>
          <p className="text-xs text-gray-400 mt-1">
            TODO: Connect to real data sources (see inline comments)
          </p>
        </footer>
      </main>
    </div>
  );
}
