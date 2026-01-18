import { VenturesList } from '@/components/ControlPanel/VenturesList';
import { Breadcrumbs } from '@/components/ControlPanel/Breadcrumbs';
import { fixtureVentures } from '@/lib/fixtures/factory-fixtures';

export const metadata = {
  title: 'Ventures | Factory OS',
  description: 'All ventures in the Factory',
};

export default function VenturesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumbs
          items={[
            { label: 'Factory', href: '/factory' },
            { label: 'Ventures' }
          ]}
        />

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Ventures</h1>
          <p className="text-neutral-500">All ventures created by Factory OS</p>
        </div>

        <VenturesList ventures={fixtureVentures} />
      </div>
    </div>
  );
}
