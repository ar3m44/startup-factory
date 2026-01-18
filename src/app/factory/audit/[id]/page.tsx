import { notFound } from 'next/navigation';
import { AuditDetail } from '@/components/ControlPanel/AuditDetail';
import { Header } from '@/components/Dashboard/Header';
import { getAuditEntryById } from '@/lib/db';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const entry = getAuditEntryById(id);

  if (!entry) {
    return { title: 'Запись не найдена | Factory OS' };
  }

  return {
    title: `${entry.actor}: ${entry.action} | Factory OS`,
    description: `Запись журнала: ${entry.action} от ${entry.actor}`,
  };
}

export default async function AuditDetailPage({ params }: PageProps) {
  const { id } = await params;
  const entry = getAuditEntryById(id);

  if (!entry) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <AuditDetail entry={entry} />
      </div>
    </div>
  );
}
