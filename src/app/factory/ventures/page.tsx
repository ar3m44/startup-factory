import { VenturesList } from '@/components/ControlPanel/VenturesList';
import { Breadcrumbs } from '@/components/ControlPanel/Breadcrumbs';
import { Header } from '@/components/Dashboard/Header';
import { fixtureVentures } from '@/lib/fixtures/factory-fixtures';

export const metadata = {
  title: 'Проекты | Factory OS',
  description: 'Все проекты Factory OS',
};

export default function VenturesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/factory' },
            { label: 'Проекты' }
          ]}
        />

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Проекты</h1>
          <p className="text-neutral-500">Все стартапы, созданные Factory OS</p>
        </div>

        <VenturesList ventures={fixtureVentures} />
      </div>
    </div>
  );
}
