import Link from 'next/link';
import { Breadcrumbs } from './Breadcrumbs';
import { StatusBadge, getVentureStatusVariant } from './StatusBadge';
import type { Venture } from '@/lib/types';

interface VentureDetailProps {
  venture: Venture;
}

const statusLabels: Record<string, string> = {
  active: 'Активен',
  building: 'В разработке',
  launched: 'Запущен',
  paused: 'Пауза',
  killed: 'Закрыт',
  validating: 'Проверка',
};

export function VentureDetail({ venture }: VentureDetailProps) {
  const blueprint = venture.blueprint;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/factory' },
          { label: 'Проекты', href: '/factory/ventures' },
          { label: venture.name }
        ]}
      />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold text-neutral-900">
            {venture.name}
          </h1>
          <StatusBadge
            label={statusLabels[venture.status] || venture.status}
            variant={getVentureStatusVariant(venture.status)}
          />
          <span className="text-sm px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
            {venture.track}
          </span>
        </div>
        <p className="text-neutral-500">{blueprint?.tagline}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <section className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h2 className="text-lg font-medium mb-4">Описание</h2>
            <p className="text-neutral-600 mb-4">{blueprint?.description}</p>

            {blueprint?.targetAudience && (
              <div className="mt-4 p-4 bg-neutral-50 rounded-xl">
                <h3 className="text-sm font-medium text-neutral-900 mb-2">Целевая аудитория</h3>
                <p className="text-sm text-neutral-600">{blueprint.targetAudience.who}</p>
                <p className="text-sm text-neutral-500 mt-1">
                  <span className="font-medium">Проблема:</span> {blueprint.targetAudience.problem}
                </p>
                <p className="text-sm text-neutral-500">
                  <span className="font-medium">Размер рынка:</span> {blueprint.targetAudience.size?.toLocaleString('ru-RU')} пользователей
                </p>
              </div>
            )}
          </section>

          {/* MVP */}
          {blueprint?.mvp && (
            <section className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h2 className="text-lg font-medium mb-4">MVP</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">Ключевые функции</h3>
                  <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                    {blueprint.mvp.coreFeatures?.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">Технологии</h3>
                  <div className="flex flex-wrap gap-2">
                    {blueprint.mvp.techStack?.map((tech, i) => (
                      <span key={i} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">Срок разработки</h3>
                  <p className="text-sm text-neutral-600">{blueprint.mvp.estimatedTime}</p>
                </div>
              </div>
            </section>
          )}

          {/* Pricing */}
          {blueprint?.pricing && (
            <section className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h2 className="text-lg font-medium mb-4">Монетизация</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-neutral-900">
                  {blueprint.pricing.price}
                </span>
                <span className="text-neutral-500">/ {blueprint.pricing.model === 'subscription' ? 'подписка' : blueprint.pricing.model === 'one-time' ? 'единоразово' : blueprint.pricing.model}</span>
              </div>
              <p className="text-sm text-neutral-500 mt-2">
                Платёжная система: {blueprint.pricing.paymentProvider}
              </p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metrics */}
          <section className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h2 className="text-lg font-medium mb-4">Метрики</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">MRR</span>
                <span className="font-semibold text-lg">{(venture.metrics?.mrr || 0).toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Общий доход</span>
                <span className="font-medium">{(venture.metrics?.totalRevenue || 0).toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Пользователи</span>
                <span className="font-medium">{venture.metrics?.totalUsers || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Конверсия</span>
                <span className="font-medium">{venture.metrics?.conversionRate || 0}%</span>
              </div>
            </div>
          </section>

          {/* Info */}
          <section className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h2 className="text-lg font-medium mb-4">Информация</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">ID</span>
                <span className="font-mono text-xs bg-neutral-100 px-2 py-1 rounded">{venture.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Создан</span>
                <span>{new Date(venture.createdAt).toLocaleDateString('ru-RU')}</span>
              </div>
              {venture.url && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">URL</span>
                  <a href={venture.url} target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:underline">
                    Открыть →
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Actions */}
          <section className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h2 className="text-lg font-medium mb-4">Действия</h2>
            <div className="space-y-2">
              <Link
                href={`/factory/tasks?venture=${venture.id}`}
                className="block w-full text-center py-2.5 px-4 bg-neutral-900 text-white rounded-xl
                         hover:bg-neutral-800 transition-colors text-sm font-medium"
              >
                Задачи проекта
              </Link>
              <Link
                href={`/factory/audit?venture=${venture.id}`}
                className="block w-full text-center py-2.5 px-4 border border-neutral-200 text-neutral-700 rounded-xl
                         hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Журнал операций
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
