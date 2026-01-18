import Link from 'next/link';
import { Breadcrumbs } from './Breadcrumbs';
import { StatusBadge, getVentureStatusVariant } from './StatusBadge';
import type { Venture } from '@/lib/types';

interface VentureDetailProps {
  venture: Venture;
}

export function VentureDetail({ venture }: VentureDetailProps) {
  const blueprint = venture.blueprint;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Factory', href: '/factory' },
          { label: 'Ventures', href: '/factory/ventures' },
          { label: venture.name }
        ]}
      />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold text-neutral-900">
            {venture.name}
          </h1>
          <StatusBadge
            label={venture.status}
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
          <section className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Overview</h2>
            <p className="text-neutral-600 mb-4">{blueprint?.description}</p>

            {blueprint?.targetAudience && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-neutral-900 mb-2">Target Audience</h3>
                <p className="text-sm text-neutral-600">{blueprint.targetAudience.who}</p>
                <p className="text-sm text-neutral-500 mt-1">
                  Problem: {blueprint.targetAudience.problem}
                </p>
                <p className="text-sm text-neutral-500">
                  Market size: {blueprint.targetAudience.size?.toLocaleString()} users
                </p>
              </div>
            )}
          </section>

          {/* MVP */}
          {blueprint?.mvp && (
            <section className="bg-white border border-neutral-200 rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">MVP</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">Core Features</h3>
                  <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                    {blueprint.mvp.coreFeatures?.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {blueprint.mvp.techStack?.map((tech, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-neutral-100 text-neutral-700 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">Estimated Time</h3>
                  <p className="text-sm text-neutral-600">{blueprint.mvp.estimatedTime}</p>
                </div>
              </div>
            </section>
          )}

          {/* Pricing */}
          {blueprint?.pricing && (
            <section className="bg-white border border-neutral-200 rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Pricing</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-neutral-900">
                  {blueprint.pricing.price}
                </span>
                <span className="text-neutral-500">/ {blueprint.pricing.model}</span>
              </div>
              <p className="text-sm text-neutral-500 mt-2">
                Payment: {blueprint.pricing.paymentProvider}
              </p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metrics */}
          <section className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Metrics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-500">MRR</span>
                <span className="font-medium">{venture.metrics?.mrr?.toLocaleString() || 0} RUB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Revenue</span>
                <span className="font-medium">{venture.metrics?.totalRevenue?.toLocaleString() || 0} RUB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Users</span>
                <span className="font-medium">{venture.metrics?.totalUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Conversion</span>
                <span className="font-medium">{venture.metrics?.conversionRate || 0}%</span>
              </div>
            </div>
          </section>

          {/* Info */}
          <section className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">ID</span>
                <span className="font-mono text-xs">{venture.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Created</span>
                <span>{new Date(venture.createdAt).toLocaleDateString()}</span>
              </div>
              {venture.url && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">URL</span>
                  <a href={venture.url} target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:underline">
                    Visit →
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Actions */}
          <section className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Actions</h2>
            <div className="space-y-2">
              <Link
                href={`/factory/tasks?venture=${venture.id}`}
                className="block w-full text-center py-2 px-4 bg-neutral-900 text-white rounded-lg
                         hover:bg-neutral-800 transition-colors text-sm"
              >
                View Tasks
              </Link>
              <Link
                href={`/factory/audit?venture=${venture.id}`}
                className="block w-full text-center py-2 px-4 border border-neutral-200 text-neutral-700 rounded-lg
                         hover:bg-neutral-50 transition-colors text-sm"
              >
                View Audit Log
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
