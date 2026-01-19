'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Dashboard/Header';
import { Button } from '@/components/UI/Button';
import { Modal } from '@/components/UI/Modal';
import { SkeletonTable } from '@/components/UI/Skeleton';
import { Pagination } from '@/components/UI/Pagination';

interface EngineerRun {
  id: string;
  taskId: string;
  startedAt: string;
  finishedAt?: string;
  status: 'running' | 'success' | 'failed' | 'cancelled';
  model: string;
  promptTokens: number;
  completionTokens: number;
  filesCreated?: string[];
  filesUpdated?: string[];
  filesDeleted?: string[];
  errorMessage?: string;
  logs?: Array<{ timestamp: string; level: string; message: string }>;
}

interface EngineerRunsResponse {
  success: boolean;
  runs: EngineerRun[];
  total: number;
}

const statusColors: Record<string, string> = {
  running: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-neutral-100 text-neutral-700',
};

const statusLabels: Record<string, string> = {
  running: 'В процессе',
  success: 'Успешно',
  failed: 'Ошибка',
  cancelled: 'Отменено',
};

const ITEMS_PER_PAGE = 15;

export default function EngineerRunsPage() {
  const [runs, setRuns] = useState<EngineerRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<EngineerRun | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/engineer-runs?limit=100');
      const data: EngineerRunsResponse = await res.json();
      if (data.success) {
        setRuns(data.runs);
      }
    } catch (error) {
      console.error('Failed to load engineer runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (start: string, end?: string): string => {
    if (!end) return 'В процессе...';
    const durationMs = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}м ${seconds % 60}с`;
    }
    return `${seconds}с`;
  };

  const formatTokens = (prompt: number, completion: number): string => {
    const total = prompt + completion;
    if (total === 0) return '—';
    return `${total.toLocaleString()} (${prompt.toLocaleString()} + ${completion.toLocaleString()})`;
  };

  const totalPages = Math.ceil(runs.length / ITEMS_PER_PAGE);
  const paginatedRuns = runs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate stats
  const stats = {
    total: runs.length,
    successful: runs.filter(r => r.status === 'success').length,
    failed: runs.filter(r => r.status === 'failed').length,
    running: runs.filter(r => r.status === 'running').length,
    totalTokens: runs.reduce((sum, r) => sum + r.promptTokens + r.completionTokens, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <SkeletonTable />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Engineer Runs</h1>
            <p className="text-neutral-500 mt-1">История запусков AI-инженера</p>
          </div>
          <Button variant="secondary" onClick={loadRuns}>
            Обновить
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-neutral-200">
            <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
            <p className="text-xs text-neutral-500">Всего запусков</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-neutral-200">
            <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
            <p className="text-xs text-neutral-500">Успешных</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-neutral-200">
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            <p className="text-xs text-neutral-500">С ошибками</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-neutral-200">
            <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
            <p className="text-xs text-neutral-500">В процессе</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-neutral-200">
            <p className="text-2xl font-bold text-neutral-900">{stats.totalTokens.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">Токенов использовано</p>
          </div>
        </div>

        {/* Runs Table */}
        {runs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Запусков пока нет</h3>
            <p className="text-neutral-500">
              Здесь будет история запусков AI-инженера для выполнения задач
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: Card layout */}
            <div className="lg:hidden space-y-3">
              {paginatedRuns.map((run) => (
                <div
                  key={run.id}
                  className="bg-white border border-neutral-200 rounded-xl p-4 cursor-pointer hover:border-neutral-300 transition-colors"
                  onClick={() => setSelectedRun(run)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-sm font-medium text-neutral-900">{run.taskId}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {new Date(run.startedAt).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[run.status]}`}>
                      {statusLabels[run.status]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-neutral-500">Модель</p>
                      <p className="font-medium text-neutral-900">{run.model}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Длительность</p>
                      <p className="font-medium text-neutral-900">
                        {formatDuration(run.startedAt, run.finishedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden lg:block bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Task ID
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Модель
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Токены
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Длительность
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Дата
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {paginatedRuns.map((run) => (
                    <tr
                      key={run.id}
                      className="hover:bg-neutral-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedRun(run)}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-neutral-900">
                          {run.taskId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[run.status]}`}>
                          {statusLabels[run.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-neutral-600">{run.model}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-neutral-600">
                          {formatTokens(run.promptTokens, run.completionTokens)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-neutral-600">
                          {formatDuration(run.startedAt, run.finishedAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-neutral-500">
                          {new Date(run.startedAt).toLocaleString('ru-RU')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Run Detail Modal */}
      <Modal
        isOpen={!!selectedRun}
        onClose={() => setSelectedRun(null)}
        title="Детали запуска"
        size="lg"
      >
        {selectedRun && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-lg font-semibold text-neutral-900">
                  {selectedRun.taskId}
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  {new Date(selectedRun.startedAt).toLocaleString('ru-RU')}
                </p>
              </div>
              <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${statusColors[selectedRun.status]}`}>
                {statusLabels[selectedRun.status]}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-500 mb-1">Модель</p>
                <p className="font-medium text-neutral-900">{selectedRun.model}</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-500 mb-1">Длительность</p>
                <p className="font-medium text-neutral-900">
                  {formatDuration(selectedRun.startedAt, selectedRun.finishedAt)}
                </p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-500 mb-1">Prompt Tokens</p>
                <p className="font-medium text-neutral-900">
                  {selectedRun.promptTokens.toLocaleString()}
                </p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-500 mb-1">Completion Tokens</p>
                <p className="font-medium text-neutral-900">
                  {selectedRun.completionTokens.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {selectedRun.errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-700 mb-1">Ошибка</p>
                <p className="text-sm text-red-600 font-mono">{selectedRun.errorMessage}</p>
              </div>
            )}

            {/* Files Changed */}
            {(selectedRun.filesCreated?.length || selectedRun.filesUpdated?.length || selectedRun.filesDeleted?.length) && (
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-3">Изменённые файлы</p>
                <div className="space-y-2">
                  {selectedRun.filesCreated?.map((file) => (
                    <div key={file} className="flex items-center gap-2 text-sm">
                      <span className="text-green-600 font-medium">CREATE</span>
                      <span className="font-mono text-neutral-600">{file}</span>
                    </div>
                  ))}
                  {selectedRun.filesUpdated?.map((file) => (
                    <div key={file} className="flex items-center gap-2 text-sm">
                      <span className="text-blue-600 font-medium">UPDATE</span>
                      <span className="font-mono text-neutral-600">{file}</span>
                    </div>
                  ))}
                  {selectedRun.filesDeleted?.map((file) => (
                    <div key={file} className="flex items-center gap-2 text-sm">
                      <span className="text-red-600 font-medium">DELETE</span>
                      <span className="font-mono text-neutral-600">{file}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logs */}
            {selectedRun.logs && selectedRun.logs.length > 0 && (
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-3">Логи</p>
                <div className="bg-neutral-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {selectedRun.logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs font-mono mb-1">
                      <span className="text-neutral-500 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString('ru-RU')}
                      </span>
                      <span className={
                        log.level === 'error' ? 'text-red-400' :
                        log.level === 'warn' ? 'text-yellow-400' :
                        'text-neutral-300'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
