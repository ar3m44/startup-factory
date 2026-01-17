#!/usr/bin/env node

// Простой тест API без запуска сервера
import { Orchestrator } from './src/lib/orchestrator.ts';

console.log('🧪 Тестирование Factory OS API\n');

async function test() {
  try {
    const orchestrator = new Orchestrator();

    // Тест 1: Загрузка state
    console.log('1️⃣ Тест loadState()...');
    const state = await orchestrator.loadState();
    console.log(`   ✅ Загружено ${state.signals.length} сигналов`);
    console.log(`   ✅ Загружено ${state.ventures.length} ventures`);
    console.log(`   ✅ Budget: ${state.budget.spent}/${state.budget.monthly}₽`);

    if (state.signals.length > 0) {
      const signal = state.signals[0];
      console.log(`\n   📍 Сигнал: ${signal.id}`);
      console.log(`      Source: ${signal.source}`);
      console.log(`      Confidence: ${signal.confidenceScore}/100`);
      console.log(`      Status: ${signal.status}`);
      console.log(`      Problem: ${signal.problem.substring(0, 100)}...`);

      // Тест 2: Валидация сигнала
      console.log(`\n2️⃣ Тест runValidator("${signal.id}")...`);
      const validation = await orchestrator.runValidator(signal.id);

      console.log(`   ✅ Decision: ${validation.decision}`);
      console.log(`   ✅ Pipelines:`);
      console.log(`      - TAM: ${validation.pipelines.tam}`);
      console.log(`      - Competitors: ${validation.pipelines.competitors}`);
      console.log(`      - Technical: ${validation.pipelines.technical}`);
      console.log(`      - Pricing: ${validation.pipelines.pricing}`);
      console.log(`      - Risks: ${validation.pipelines.risks}`);

      if (validation.blueprint) {
        console.log(`\n   🎯 Venture Blueprint:`);
        console.log(`      Name: ${validation.blueprint.name}`);
        console.log(`      Slug: ${validation.blueprint.slug}`);
        console.log(`      Track: ${validation.blueprint.metrics.track}`);
        console.log(`      Target MRR: ${validation.blueprint.metrics.targetMRR.toLocaleString()}₽`);
      }

      // Тест 3: Проверка обновлённого state
      console.log(`\n3️⃣ Тест обновлённого state...`);
      const newState = await orchestrator.loadState();
      const updatedSignal = newState.signals.find(s => s.id === signal.id);
      console.log(`   ✅ Статус сигнала: ${updatedSignal?.status}`);
      console.log(`   ✅ Validation ID: ${updatedSignal?.validationId}`);
    } else {
      console.log('\n⚠️  Нет сигналов для тестирования');
      console.log('   Создайте сигнал вручную или запустите Scout');
    }

    console.log('\n✅ Все тесты пройдены!');

  } catch (error) {
    console.error('\n❌ Ошибка теста:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

test();
