// ============================================================================
// SCOUT AGENT - обёртка для запуска Scout агента
// ============================================================================

import type { Signal } from '../types';
import fs from 'fs/promises';
import path from 'path';

/**
 * Scout Agent - находит идеи продуктов через анализ рынка
 *
 * Источники:
 * - Reddit (r/SaaS, r/Entrepreneur, r/startups)
 * - Hacker News (Ask HN, Show HN)
 * - Twitter/X (#buildinpublic, #indiehackers)
 * - Product Hunt
 * - Telegram каналы (русский рынок)
 */
export class ScoutAgent {
  private signalsDir: string;

  constructor() {
    this.signalsDir = path.join(process.cwd(), 'factory', 'signals');
  }

  /**
   * Найти сигналы рынка
   *
   * @param maxSignals - максимальное количество сигналов для поиска
   * @returns Массив найденных сигналов
   */
  async findSignals(maxSignals: number = 10): Promise<Signal[]> {
    console.log(`🔍 Scout: searching for up to ${maxSignals} signals...`);

    // TODO: В Phase 1 это будет mock данные
    // В Phase 2 здесь будет реальный поиск через:
    // - Reddit API
    // - Hacker News API
    // - Twitter API
    // - Web scraping

    // Phase 1: возвращаем пустой массив
    // Пользователь будет создавать сигналы вручную через UI
    const signals: Signal[] = [];

    console.log(`✅ Scout: found ${signals.length} signals`);

    // Сохранить сигналы в файлы
    for (const signal of signals) {
      await this.saveSignal(signal);
    }

    return signals;
  }

  /**
   * Сохранить сигнал в файл
   */
  private async saveSignal(signal: Signal): Promise<void> {
    const filePath = path.join(this.signalsDir, `${signal.id}.md`);

    const content = this.formatSignalMarkdown(signal);

    await fs.mkdir(this.signalsDir, { recursive: true });
    await fs.writeFile(filePath, content);

    console.log(`💾 Saved signal: ${signal.id}`);
  }

  /**
   * Форматировать сигнал в Markdown
   */
  private formatSignalMarkdown(signal: Signal): string {
    return `# ${signal.id}

## Основная информация
**Дата обнаружения**: ${signal.date}
**Источник**: ${signal.source}
**Ссылка**: ${signal.sourceUrl}
**Confidence Score**: ${signal.confidenceScore}/100

## Описание сигнала

### Проблема
${signal.problem}

### Целевая аудитория
${signal.targetAudience}

### Цитаты (минимум 3)
${signal.quotes.map((q, i) => `${i + 1}. "${q.text}" — ${q.url}`).join('\n')}

### Контекст
${signal.context}

## Возможное решение

### Описание MVP
${signal.mvpDescription}

### Предполагаемая цена
${signal.price}

### Срок реализации
${signal.track}

### Ключевые фичи (топ-3)
${signal.keyFeatures.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## Анализ рынка (предварительный)

### Потенциальный TAM (Total Addressable Market)
${signal.tam}

### Существующие конкуренты
${signal.competitors.map((c, i) => `${i + 1}. **${c.name}** — ${c.description} (${c.price})`).join('\n')}

### Почему мы можем сделать лучше?
${signal.advantage}

## Оценка критериев

### Обязательные критерии
- [${signal.criteria.mandatory.repeatability ? 'x' : ' '}] Повторяемость (3+ упоминания)
- [${signal.criteria.mandatory.targetAudienceSize ? 'x' : ' '}] ЦА >10k
- [${signal.criteria.mandatory.paymentWillingness ? 'x' : ' '}] Платёжеспособность
- [${signal.criteria.mandatory.feasibility ? 'x' : ' '}] Реализуемость
- [${signal.criteria.mandatory.noFreeAlternatives ? 'x' : ' '}] Нет сильных бесплатных альтернатив

### Желательные критерии (бонус к Confidence)
- [${signal.criteria.optional.urgency ? 'x' : ' '}] Срочность
- [${signal.criteria.optional.simpleMVP ? 'x' : ' '}] Простота MVP
- [${signal.criteria.optional.viralPotential ? 'x' : ' '}] Вирусный потенциал
- [${signal.criteria.optional.recurringRevenue ? 'x' : ' '}] Recurring revenue
- [${signal.criteria.optional.lowCompetition ? 'x' : ' '}] Low competition

## Confidence Score: ${signal.confidenceScore}/100

### Расчёт
- Обязательные критерии (5 шт): каждый = 12 баллов (макс 60)
- Желательные критерии (5 шт): каждый = 8 баллов (макс 40)
- Итого: ${signal.confidenceScore}/100

**Пороги:**
- 70-100: Отличный сигнал, передать в Validator
- 50-69: Хороший сигнал, но требует дополнительного анализа
- 0-49: Слабый сигнал, отклонить

## Риски
${signal.risks.map((r, i) => `${i + 1}. **${r.description}** — ${r.probability} вероятность\n   Митигация: ${r.mitigation}`).join('\n')}

## Следующий шаг
- [${signal.status === 'validated' ? 'x' : ' '}] Передать Validator агенту для полной валидации
- [${signal.status === 'rejected' ? 'x' : ' '}] Отклонить (если Confidence <70)

---

**Created by**: Scout Agent
**Status**: ${signal.status}
`;
  }

  /**
   * Загрузить сигнал из файла
   */
  async loadSignal(signalId: string): Promise<Signal | null> {
    const filePath = path.join(this.signalsDir, `${signalId}.md`);

    try {
      await fs.access(filePath);
      // TODO: парсинг markdown обратно в Signal объект
      // Пока просто возвращаем null
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Получить все сигналы
   */
  async getAllSignals(): Promise<Signal[]> {
    try {
      await fs.readdir(this.signalsDir);
      // TODO: парсинг каждого файла в Signal объект
      // Пока возвращаем пустой массив
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Рассчитать confidence score для сигнала
   */
  calculateConfidenceScore(signal: Omit<Signal, 'confidenceScore'>): number {
    // Обязательные критерии: 12 баллов каждый (макс 60)
    const mandatory = signal.criteria.mandatory;
    let score = 0;

    if (mandatory.repeatability) score += 12;
    if (mandatory.targetAudienceSize) score += 12;
    if (mandatory.paymentWillingness) score += 12;
    if (mandatory.feasibility) score += 12;
    if (mandatory.noFreeAlternatives) score += 12;

    // Желательные критерии: 8 баллов каждый (макс 40)
    const optional = signal.criteria.optional;

    if (optional.urgency) score += 8;
    if (optional.simpleMVP) score += 8;
    if (optional.viralPotential) score += 8;
    if (optional.recurringRevenue) score += 8;
    if (optional.lowCompetition) score += 8;

    return score;
  }
}
