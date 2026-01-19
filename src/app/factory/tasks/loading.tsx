import { Header } from '@/components/Dashboard/Header';
import { Breadcrumbs } from '@/components/ControlPanel/Breadcrumbs';
import { SkeletonTasksPage } from '@/components/UI/Skeleton';

export default function TasksLoading() {
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
        <SkeletonTasksPage />
      </div>
    </div>
  );
}
