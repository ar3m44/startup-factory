import { TasksList } from '@/components/ControlPanel/TasksList';
import { Breadcrumbs } from '@/components/ControlPanel/Breadcrumbs';
import { fixtureTasks } from '@/lib/fixtures/factory-fixtures';

export const metadata = {
  title: 'Tasks | Factory OS',
  description: 'All tasks in the Factory',
};

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumbs
          items={[
            { label: 'Factory', href: '/factory' },
            { label: 'Tasks' }
          ]}
        />

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Tasks</h1>
          <p className="text-neutral-500">Engineering tasks executed by Factory OS</p>
        </div>

        <TasksList tasks={fixtureTasks} />
      </div>
    </div>
  );
}
