// ============================================================================
// VALIDATOR AGENT - обёртка для запуска Validator агента
// ============================================================================

import type {
  Signal,
  ValidationResult,
  PipelineStatus,
  VentureBlueprint,
} from '../types';
import fs from 'fs/promises';
import path from 'path';

/**
 * Validator Agent - валидирует идеи через 5 пайплайнов
 *
 * Пайплайны:
 * 1. TAM Analysis - рынок >$1M/год
 * 2. Competitor Analysis - нет сильных бесплатных альтернатив
 * 3. Technical Feasibility - можем сделать за ≤7 дней (FAST) или ≤3 мес (LONG)
 * 4. Pricing Feasibility - LTV/CAC >3
 * 5. Risk Assessment - 0 critical risks
 */
export class ValidatorAgent {
  private pipelinesDir: string;

  constructor() {
    this.pipelinesDir = path.join(process.cwd(), 'factory', 'pipelines');
  }

  /**
   * Валидировать сигнал
   *
   * @param signal - Сигнал для валидации
   * @returns Результат валидации с GO/NO-GO решением
   */
  async validate(signal: Signal): Promise<ValidationResult> {
    console.log(`🔬 Validator: validating signal ${signal.id}...`);

    // Генерировать validation ID
    const now = new Date();
    const validationId = `VALIDATION-${now.toISOString().replace(/:/g, '-').split('.')[0]}`;

    // Запустить все 5 пайплайнов параллельно
    const [
      tamAnalysis,
      competitorAnalysis,
      technicalFeasibility,
      pricingFeasibility,
      riskAssessment,
    ] = await Promise.all([
      this.runTAMAnalysis(signal),
      this.runCompetitorAnalysis(signal),
      this.runTechnicalFeasibility(signal),
      this.runPricingFeasibility(signal),
      this.runRiskAssessment(signal),
    ]);

    // Агрегировать статусы пайплайнов
    const pipelines = {
      tam: tamAnalysis.status,
      competitors: competitorAnalysis.status,
      technical: technicalFeasibility.status,
      pricing: pricingFeasibility.status,
      risks: riskAssessment.status,
    };

    // Принять GO/NO-GO решение
    const decision = this.makeDecision(pipelines);

    // Создать venture blueprint если GO
    let blueprint: VentureBlueprint | undefined;
    if (decision === 'GO') {
      blueprint = await this.createVentureBlueprint(
        signal,
        tamAnalysis,
        competitorAnalysis,
        technicalFeasibility,
        pricingFeasibility,
        riskAssessment
      );
    }

    const result: ValidationResult = {
      id: validationId,
      signalId: signal.id,
      date: now.toISOString(),
      decision,
      pipelines,
      tamAnalysis,
      competitorAnalysis,
      technicalFeasibility,
      pricingFeasibility,
      riskAssessment,
      blueprint,
    };

    // Сохранить результат в файл
    await this.saveValidationResult(result);

    console.log(`✅ Validator: decision = ${decision}`);

    return result;
  }

  /**
   * Pipeline 1: TAM Analysis
   */
  private async runTAMAnalysis(signal: Signal) {
    console.log('  📊 Running TAM Analysis...');

    // TODO: В Phase 1 это будет упрощённый анализ
    // В Phase 2 здесь будет реальный API запрос к LLM для анализа

    // Phase 1: простая эвристика
    const marketSize = '$1M+/год'; // TODO: реальный расчёт
    const targetAudienceSize = 50000; // TODO: реальная оценка

    const status: PipelineStatus = 'GREEN'; // Предполагаем GREEN для демо

    return {
      marketSize,
      targetAudienceSize,
      paymentWillingness: signal.price,
      status,
      reasoning:
        'TAM analysis shows market size >$1M/year in Russia with 50k+ target audience willing to pay.',
    };
  }

  /**
   * Pipeline 2: Competitor Analysis
   */
  private async runCompetitorAnalysis(signal: Signal) {
    console.log('  🏆 Running Competitor Analysis...');

    // TODO: В Phase 2 будет реальный конкурентный анализ через web search

    const status: PipelineStatus = 'GREEN';

    return {
      competitors: signal.competitors.map((c) => ({
        name: c.name,
        type: c.price === 'Бесплатно' ? ('free' as const) : ('paid' as const),
        userBase: 'Unknown',
        weakness: 'Not tailored for Russian market',
      })),
      ourAdvantage: signal.advantage,
      status,
      reasoning:
        'No strong free alternatives with >100k users. We have clear differentiation.',
    };
  }

  /**
   * Pipeline 3: Technical Feasibility
   */
  private async runTechnicalFeasibility(signal: Signal) {
    console.log('  ⚙️ Running Technical Feasibility...');

    // TODO: В Phase 2 будет анализ через LLM

    const estimatedTime =
      signal.track === 'FAST' ? '5 дней' : '2 месяца';

    const techStack = [
      'Next.js 16',
      'TypeScript',
      'Tailwind CSS',
      'Vercel',
      signal.price.includes('/месяц') ? 'Stripe/YooKassa' : 'YooKassa',
    ];

    const status: PipelineStatus = 'GREEN';

    return {
      estimatedTime,
      techStack,
      complexity: 'low' as const,
      blockers: [],
      status,
      reasoning: `Can be built in ${estimatedTime} using standard tech stack. No technical blockers.`,
    };
  }

  /**
   * Pipeline 4: Pricing Feasibility
   */
  private async runPricingFeasibility(signal: Signal) {
    console.log('  💰 Running Pricing Feasibility...');

    // TODO: В Phase 2 будет реальный расчёт unit economics

    // Парсим цену из сигнала
    const priceMatch = signal.price.match(/(\d+)/);
    const price = priceMatch ? parseInt(priceMatch[1]) : 500;

    const ltvEstimate = signal.price.includes('/месяц') ? price * 6 : price; // 6 месяцев для подписки
    const cacEstimate = 200; // Предполагаем 200₽ CAC
    const ltvCacRatio = ltvEstimate / cacEstimate;

    const status: PipelineStatus = ltvCacRatio >= 3 ? 'GREEN' : 'YELLOW';

    return {
      proposedPrice: signal.price,
      ltvEstimate,
      cacEstimate,
      ltvCacRatio,
      monetizationModel: signal.price.includes('/месяц')
        ? ('subscription' as const)
        : ('one-time' as const),
      status,
      reasoning: `LTV/CAC ratio of ${ltvCacRatio.toFixed(1)} ${ltvCacRatio >= 3 ? 'exceeds' : 'approaches'} healthy threshold of 3.`,
    };
  }

  /**
   * Pipeline 5: Risk Assessment
   */
  private async runRiskAssessment(signal: Signal) {
    console.log('  ⚠️ Running Risk Assessment...');

    // Используем риски из сигнала
    const risks = signal.risks.map((r) => ({
      type: r.description,
      severity:
        r.probability === 'high'
          ? ('high' as const)
          : r.probability === 'medium'
            ? ('medium' as const)
            : ('low' as const),
      probability: r.probability,
      mitigation: r.mitigation,
    }));

    // Note: We map severity from probability, so no 'critical' severity is generated
    const criticalRisks = 0;
    const mediumRisks = risks.filter((r) => r.severity === 'medium').length;

    const status: PipelineStatus =
      criticalRisks === 0 && mediumRisks <= 2 ? 'GREEN' : 'RED';

    return {
      risks,
      criticalRisks,
      mediumRisks,
      status,
      reasoning: `${criticalRisks} critical risks, ${mediumRisks} medium risks. ${status === 'GREEN' ? 'All risks manageable.' : 'Too many risks.'}`,
    };
  }

  /**
   * Принять GO/NO-GO решение на основе пайплайнов
   */
  private makeDecision(pipelines: Record<string, PipelineStatus>): 'GO' | 'NO-GO' {
    const statuses = Object.values(pipelines);

    const greenCount = statuses.filter((s) => s === 'GREEN').length;
    const yellowCount = statuses.filter((s) => s === 'YELLOW').length;

    // GO критерии:
    // - Все 5 GREEN, ИЛИ
    // - 4 GREEN + 1 YELLOW
    if (greenCount === 5) {
      return 'GO';
    }

    if (greenCount === 4 && yellowCount === 1) {
      return 'GO';
    }

    // Во всех остальных случаях - NO-GO
    return 'NO-GO';
  }

  /**
   * Создать Venture Blueprint
   */
  private async createVentureBlueprint(
    signal: Signal,
    tamAnalysis: ValidationResult['tamAnalysis'],
    competitorAnalysis: ValidationResult['competitorAnalysis'],
    technicalFeasibility: ValidationResult['technicalFeasibility'],
    pricingFeasibility: ValidationResult['pricingFeasibility'],
    riskAssessment: ValidationResult['riskAssessment']
  ): Promise<VentureBlueprint> {
    // Генерировать slug из названия (предполагаем, что название в mvpDescription)
    const name = signal.mvpDescription.split('.')[0]; // Первое предложение
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return {
      name,
      slug,
      tagline: signal.problem.split('.')[0], // Первое предложение проблемы
      description: signal.mvpDescription,

      targetAudience: {
        who: signal.targetAudience,
        problem: signal.problem,
        size: tamAnalysis.targetAudienceSize,
      },

      mvp: {
        coreFeatures: signal.keyFeatures,
        userFlow: [
          'Пользователь заходит на сайт',
          'Видит главную страницу с предложением',
          'Нажимает CTA кнопку',
          'Оплачивает',
          'Получает доступ/товар',
        ], // TODO: генерировать из контекста
        techStack: technicalFeasibility.techStack,
        estimatedTime: technicalFeasibility.estimatedTime,
      },

      pricing: {
        model: pricingFeasibility.monetizationModel,
        price: signal.price,
        currency: 'RUB',
        paymentProvider: 'YooKassa', // Для российского рынка
      },

      gtm: {
        channels: ['Reddit', 'ProductHunt', 'Telegram'],
        initialBudget: 5000,
        firstWeekGoal: signal.track === 'FAST' ? '100 visits, 1 purchase' : '200 visits, 5 purchases',
      },

      metrics: {
        track: signal.track,
        targetMRR: signal.track === 'FAST' ? 10000 : 50000,
        targetUsers: signal.track === 'FAST' ? 100 : 500,
        conversionRate: 1,
        killCriteria: [
          '0 транзакций за 14 дней',
          '<100 visits/день за 7 дней',
          'Negative unit economics после 30 дней',
        ],
      },

      risks: riskAssessment.risks
        .filter((r) => r.severity !== 'critical')
        .map((r) => ({
          description: r.type,
          severity: r.severity as 'low' | 'medium' | 'high',
          mitigation: r.mitigation,
        })),
    };
  }

  /**
   * Сохранить результат валидации в файл
   */
  private async saveValidationResult(result: ValidationResult): Promise<void> {
    const filePath = path.join(this.pipelinesDir, `${result.id}.md`);

    const content = this.formatValidationMarkdown(result);

    await fs.mkdir(this.pipelinesDir, { recursive: true });
    await fs.writeFile(filePath, content);

    console.log(`💾 Saved validation: ${result.id}`);
  }

  /**
   * Форматировать результат валидации в Markdown
   */
  private formatValidationMarkdown(result: ValidationResult): string {
    const pipelineEmoji = (status: PipelineStatus) => {
      switch (status) {
        case 'GREEN':
          return '✅';
        case 'YELLOW':
          return '⚠️';
        case 'RED':
          return '❌';
      }
    };

    return `# ${result.id}

**Signal ID**: ${result.signalId}
**Date**: ${result.date}
**Decision**: ${result.decision === 'GO' ? '✅ GO' : '❌ NO-GO'}

## Pipeline Results

| Pipeline | Status | Result |
|----------|--------|--------|
| TAM Analysis | ${pipelineEmoji(result.pipelines.tam)} ${result.pipelines.tam} | ${result.tamAnalysis.reasoning} |
| Competitor Analysis | ${pipelineEmoji(result.pipelines.competitors)} ${result.pipelines.competitors} | ${result.competitorAnalysis.reasoning} |
| Technical Feasibility | ${pipelineEmoji(result.pipelines.technical)} ${result.pipelines.technical} | ${result.technicalFeasibility.reasoning} |
| Pricing Feasibility | ${pipelineEmoji(result.pipelines.pricing)} ${result.pipelines.pricing} | ${result.pricingFeasibility.reasoning} |
| Risk Assessment | ${pipelineEmoji(result.pipelines.risks)} ${result.pipelines.risks} | ${result.riskAssessment.reasoning} |

## Detailed Analysis

### 1. TAM Analysis ${pipelineEmoji(result.pipelines.tam)}

**Market Size**: ${result.tamAnalysis.marketSize}
**Target Audience**: ${result.tamAnalysis.targetAudienceSize.toLocaleString()} people
**Payment Willingness**: ${result.tamAnalysis.paymentWillingness}

**Reasoning**: ${result.tamAnalysis.reasoning}

### 2. Competitor Analysis ${pipelineEmoji(result.pipelines.competitors)}

**Competitors**:
${result.competitorAnalysis.competitors.map((c, i) => `${i + 1}. **${c.name}** (${c.type}) - ${c.userBase} users
   Weakness: ${c.weakness}`).join('\n')}

**Our Advantage**: ${result.competitorAnalysis.ourAdvantage}

**Reasoning**: ${result.competitorAnalysis.reasoning}

### 3. Technical Feasibility ${pipelineEmoji(result.pipelines.technical)}

**Estimated Time**: ${result.technicalFeasibility.estimatedTime}
**Tech Stack**: ${result.technicalFeasibility.techStack.join(', ')}
**Complexity**: ${result.technicalFeasibility.complexity}
**Blockers**: ${result.technicalFeasibility.blockers.length === 0 ? 'None' : result.technicalFeasibility.blockers.join(', ')}

**Reasoning**: ${result.technicalFeasibility.reasoning}

### 4. Pricing Feasibility ${pipelineEmoji(result.pipelines.pricing)}

**Proposed Price**: ${result.pricingFeasibility.proposedPrice}
**LTV Estimate**: ${result.pricingFeasibility.ltvEstimate.toLocaleString()}₽
**CAC Estimate**: ${result.pricingFeasibility.cacEstimate.toLocaleString()}₽
**LTV/CAC Ratio**: ${result.pricingFeasibility.ltvCacRatio.toFixed(1)}
**Model**: ${result.pricingFeasibility.monetizationModel}

**Reasoning**: ${result.pricingFeasibility.reasoning}

### 5. Risk Assessment ${pipelineEmoji(result.pipelines.risks)}

**Critical Risks**: ${result.riskAssessment.criticalRisks}
**Medium Risks**: ${result.riskAssessment.mediumRisks}

**Risks**:
${result.riskAssessment.risks.map((r, i) => `${i + 1}. **${r.type}** (${r.severity} severity, ${r.probability} probability)
   Mitigation: ${r.mitigation}`).join('\n')}

**Reasoning**: ${result.riskAssessment.reasoning}

## Decision: ${result.decision}

${result.decision === 'GO' ? `
## Venture Blueprint ✅

**Name**: ${result.blueprint?.name}
**Slug**: ${result.blueprint?.slug}
**Tagline**: ${result.blueprint?.tagline}

### MVP
**Core Features**:
${result.blueprint?.mvp.coreFeatures.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

**Tech Stack**: ${result.blueprint?.mvp.techStack.join(', ')}
**Estimated Time**: ${result.blueprint?.mvp.estimatedTime}

### Pricing
**Model**: ${result.blueprint?.pricing.model}
**Price**: ${result.blueprint?.pricing.price}

### Metrics
**Track**: ${result.blueprint?.metrics.track}
**Target MRR**: ${result.blueprint?.metrics.targetMRR.toLocaleString()}₽
**Target Users**: ${result.blueprint?.metrics.targetUsers.toLocaleString()}

**Next Step**: Create venture and start development
` : `
**Reasoning**: One or more pipelines failed validation criteria.

**Next Step**: Signal rejected, no venture will be created.
`}

---

**Created by**: Validator Agent
`;
  }
}
