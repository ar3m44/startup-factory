import { AuditList } from '@/components/ControlPanel/AuditList';
import { Breadcrumbs } from '@/components/ControlPanel/Breadcrumbs';
import { Header } from '@/components/Dashboard/Header';
import { getFixtureAuditEntries } from '@/lib/fixtures/factory-fixtures';

export const metadata = {
  title: 'Журнал | Factory OS',
  description: 'История операций Factory OS',
};

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/factory' },
            { label: 'Журнал' }
          ]}
        />

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Журнал операций</h1>
          <p className="text-neutral-500">Полная история действий в системе</p>
        </div>

        <AuditList entries={getFixtureAuditEntries()} />
      </div>
    </div>
  );
}
