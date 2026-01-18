import { notFound } from 'next/navigation';
import { VentureDetail } from '@/components/ControlPanel/VentureDetail';
import { Header } from '@/components/Dashboard/Header';
import { getVentureById } from '@/lib/db';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const venture = getVentureById(id);

  if (!venture) {
    return { title: 'Проект не найден | Factory OS' };
  }

  return {
    title: `${venture.name} | Factory OS`,
    description: venture.blueprint?.tagline || `Детали проекта ${venture.name}`,
  };
}

export default async function VentureDetailPage({ params }: PageProps) {
  const { id } = await params;
  const venture = getVentureById(id);

  if (!venture) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <VentureDetail venture={venture} />
      </div>
    </div>
  );
}
