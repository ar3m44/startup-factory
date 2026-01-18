'use client';

import { useState } from 'react';

interface ActionButtonsProps {
  onRunScout?: () => void;
  onCreateTask?: () => void;
  scoutLoading?: boolean;
}

export function ActionButtons({ onRunScout, onCreateTask, scoutLoading }: ActionButtonsProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onCreateTask}
        className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Создать задачу
      </button>

      <button
        onClick={onRunScout}
        disabled={scoutLoading}
        className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm font-medium disabled:opacity-50"
      >
        {scoutLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Поиск...
          </>
        ) : (
          <>
            <span>🔍</span>
            Запустить Scout
          </>
        )}
      </button>
    </div>
  );
}

interface RunEngineerButtonProps {
  taskId: string;
  taskStatus: string;
  onRun: (taskId: string) => void;
}

export function RunEngineerButton({ taskId, taskStatus, onRun }: RunEngineerButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onRun(taskId);
    } finally {
      setLoading(false);
    }
  };

  const canRun = taskStatus === 'pending' || taskStatus === 'draft';

  return (
    <button
      onClick={handleClick}
      disabled={!canRun || loading}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        canRun
          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
      }`}
    >
      {loading ? (
        <>
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Запуск...
        </>
      ) : (
        <>
          🤖 Запустить Engineer
        </>
      )}
    </button>
  );
}
