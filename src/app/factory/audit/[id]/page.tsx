import { notFound } from 'next/navigation';
import { AuditDetail } from '@/components/ControlPanel/AuditDetail';
import { fixtureAuditEntries } from '@/lib/fixtures/factory-fixtures';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const entry = fixtureAuditEntries.find(e => e.id === id);

  if (!entry) {
    return { title: 'Audit Entry Not Found | Factory OS' };
  }

  return {
    title: `${entry.actor}: ${entry.action} | Factory OS`,
    description: `Audit entry for ${entry.action} by ${entry.actor}`,
  };
}

export default async function AuditDetailPage({ params }: PageProps) {
  const { id } = await params;
  const entry = fixtureAuditEntries.find(e => e.id === id);

  if (!entry) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <AuditDetail entry={entry} />
      </div>
    </div>
  );
}
