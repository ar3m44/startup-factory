import { TasksPageClient } from './TasksPageClient';
import { Breadcrumbs } from '@/components/ControlPanel/Breadcrumbs';
import { Header } from '@/components/Dashboard/Header';
import { getFixtureTasks, getFixtureVentures } from '@/lib/fixtures/factory-fixtures';

export const metadata = {
  title: 'Задачи | Factory OS',
  description: 'Инженерные задачи Factory OS',
};

export default function TasksPage() {
  const tasks = getFixtureTasks();
  const ventures = getFixtureVentures().map(v => ({ id: v.id, name: v.name }));

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/factory' },
            { label: 'Задачи' }
          ]}
        />

        <TasksPageClient initialTasks={tasks} ventures={ventures} />
      </div>
    </div>
  );
}
