import { notFound } from 'next/navigation';
import { VentureDetail } from '@/components/ControlPanel/VentureDetail';
import { fixtureVentures } from '@/lib/fixtures/factory-fixtures';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const venture = fixtureVentures.find(v => v.id === id);

  if (!venture) {
    return { title: 'Venture Not Found | Factory OS' };
  }

  return {
    title: `${venture.name} | Factory OS`,
    description: venture.blueprint?.tagline || `Details for ${venture.name}`,
  };
}

export default async function VentureDetailPage({ params }: PageProps) {
  const { id } = await params;
  const venture = fixtureVentures.find(v => v.id === id);

  if (!venture) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <VentureDetail venture={venture} />
      </div>
    </div>
  );
}
