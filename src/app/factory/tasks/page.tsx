import { TasksList } from '@/components/ControlPanel/TasksList';
import { Breadcrumbs } from '@/components/ControlPanel/Breadcrumbs';
import { Header } from '@/components/Dashboard/Header';
import { getFixtureTasks } from '@/lib/fixtures/factory-fixtures';

export const metadata = {
  title: 'Задачи | Factory OS',
  description: 'Инженерные задачи Factory OS',
};

export default function TasksPage() {
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

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Задачи</h1>
          <p className="text-neutral-500">Инженерные задачи, выполняемые Factory OS</p>
        </div>

        <TasksList tasks={getFixtureTasks()} />
      </div>
    </div>
  );
}
