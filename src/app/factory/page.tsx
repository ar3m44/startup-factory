import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Factory Control Panel - Startup Factory OS',
  description: 'Control Panel для управления микропродуктами в Startup Factory OS',
};

export default function FactoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Startup Factory OS
          </h1>
          <p className="text-gray-600">
            Control Panel для управления микропродуктами
          </p>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Статус системы</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusCard
              title="GitHub"
              status="operational"
              description="Repository: ar3m44/startup-factory"
            />
            <StatusCard
              title="CI/CD"
              status="operational"
              description="GitHub Actions + Branch Protection"
            />
            <StatusCard
              title="Deployment"
              status="operational"
              description="Vercel (main → production)"
            />
          </div>
        </div>

        {/* Ventures */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Ventures</h2>
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">Пока нет запущенных продуктов</p>
            <p className="text-sm">
              Используй <code className="bg-gray-100 px-2 py-1 rounded">cmd: launch_fast</code> или{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">cmd: launch_long</code> для запуска
            </p>
          </div>
        </div>

        {/* Factory Structure */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Структура фабрики</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StructureCard
              title="Specifications"
              items={[
                'MASTER_PROMPT.md',
                'PROMPT_CODEX.md',
                'PROMPT_DESIGNER.md',
                'NAMING_CONVENTION.md',
                'DEFINITION_OF_DONE.md',
              ]}
            />
            <StructureCard
              title="Templates"
              items={[
                'TASK_TEMPLATE.md',
                'REPORT_TEMPLATE.md',
                'AUDIT_ENTRY_TEMPLATE.md',
                'VENTURE_CARD_TEMPLATE.md',
              ]}
            />
            <StructureCard
              title="Directories"
              items={[
                'factory/tasks/ - Задачи для Codex',
                'factory/results/ - Отчёты Codex',
                'factory/audit/ - Аудит лог',
                'ventures/ - Продукты',
              ]}
            />
            <StructureCard
              title="Commands"
              items={[
                'cmd: signal - Обработка сигнала',
                'cmd: validate - Валидация идеи',
                'cmd: launch_fast - Запуск (≤7d)',
                'cmd: launch_long - Запуск (7d-3mo)',
                'cmd: status - Статус ventures',
                'cmd: kill - Закрытие продукта',
              ]}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Ventures" value="0" />
          <StatCard title="Active Products" value="0" />
          <StatCard title="Total Revenue" value="0 ₽" />
          <StatCard title="Factory Age" value="0 days" />
        </div>
      </div>
    </div>
  );
}

// StatusCard component
function StatusCard({
  title,
  status,
  description,
}: {
  title: string;
  status: 'operational' | 'degraded' | 'down';
  description: string;
}) {
  const statusColors = {
    operational: 'bg-green-100 text-green-800',
    degraded: 'bg-yellow-100 text-yellow-800',
    down: 'bg-red-100 text-red-800',
  };

  const statusIcons = {
    operational: '✓',
    degraded: '⚠',
    down: '✗',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span
          className={`px-2 py-1 rounded text-sm font-medium ${statusColors[status]}`}
        >
          {statusIcons[status]} {status}
        </span>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

// StructureCard component
function StructureCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-gray-600 flex items-start">
            <span className="text-gray-400 mr-2">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// StatCard component
function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
