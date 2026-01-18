import { AuditList } from '@/components/ControlPanel/AuditList';
import { Breadcrumbs } from '@/components/ControlPanel/Breadcrumbs';
import { fixtureAuditEntries } from '@/lib/fixtures/factory-fixtures';

export const metadata = {
  title: 'Audit Log | Factory OS',
  description: 'Audit log of all Factory operations',
};

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumbs
          items={[
            { label: 'Factory', href: '/factory' },
            { label: 'Audit' }
          ]}
        />

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Audit Log</h1>
          <p className="text-neutral-500">Complete history of Factory operations</p>
        </div>

        <AuditList entries={fixtureAuditEntries} />
      </div>
    </div>
  );
}
