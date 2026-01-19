'use client';

import { useState } from 'react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: NewTask) => void;
  ventures: { id: string; name: string }[];
}

interface NewTask {
  ventureId: string;
  title: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2';
  type: 'feature' | 'bug' | 'refactor' | 'docs';
}

export function CreateTaskModal({ isOpen, onClose, onSubmit, ventures }: CreateTaskModalProps) {
  const [formData, setFormData] = useState<NewTask>({
    ventureId: ventures[0]?.id || '',
    title: '',
    description: '',
    priority: 'P1',
    type: 'feature',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Защита от пустого массива ventures
  if (ventures.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Нет доступных проектов</h2>
          <p className="text-neutral-600 mb-4">Сначала создайте проект (venture), чтобы добавлять задачи.</p>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        ventureId: ventures[0]?.id || '',
        title: '',
        description: '',
        priority: 'P1',
        type: 'feature',
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">Создать задачу</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Venture */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Проект
            </label>
            <select
              value={formData.ventureId}
              onChange={(e) => setFormData({ ...formData, ventureId: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {ventures.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Название задачи
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Например: Добавить авторизацию"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Подробное описание задачи..."
            />
          </div>

          {/* Priority & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Приоритет
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'P0' | 'P1' | 'P2' })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="P0">P0 - Критический</option>
                <option value="P1">P1 - Высокий</option>
                <option value="P2">P2 - Обычный</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Тип
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'feature' | 'bug' | 'refactor' | 'docs' })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="feature">Фича</option>
                <option value="bug">Баг</option>
                <option value="refactor">Рефакторинг</option>
                <option value="docs">Документация</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
