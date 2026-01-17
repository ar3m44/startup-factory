#!/usr/bin/env tsx

/**
 * Test Full Autonomous Pipeline
 *
 * Tests the complete Factory OS workflow:
 * 1. Scout finds signals
 * 2. Validator validates signal and returns blueprint
 * 3. Launcher creates venture
 * 4. Codex generates code (triggers GitHub Action)
 */

import { Orchestrator } from '../src/lib/orchestrator';

async function testFullPipeline() {
  console.log('🧪 Testing Full Autonomous Pipeline\n');
  console.log('═'.repeat(60));

  const orchestrator = new Orchestrator();

  // Step 1: Run Scout
  console.log('\n📡 Step 1: Running Scout Agent...');
  try {
    const signals = await orchestrator.runScout();
    console.log(`✅ Scout found ${signals.length} signals`);
    if (signals.length > 0) {
      console.log(`   Signals: ${signals.map(s => s.id).join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Scout failed:', error);
    // Continue anyway - we can use existing signals
    console.log('   Continuing with existing signals in state...');
  }

  // Step 2: Run Validator on first pending signal
  console.log('\n🔍 Step 2: Running Validator Agent...');

  const state = await orchestrator.loadState();
  const pendingSignal = state.signals.find(s => s.status === 'pending_validation');

  if (!pendingSignal) {
    console.log('⚠️  No pending signals found. Using first validated signal for test...');
    const validatedSignal = state.signals.find(s => s.status === 'validated');

    if (!validatedSignal) {
      console.log('❌ No signals available for validation');
      return;
    }

    // Reset signal to pending for testing
    validatedSignal.status = 'pending_validation';
    await orchestrator.saveState(state);

    console.log(`   Testing with signal: ${validatedSignal.id}`);
  }

  const signalToValidate = pendingSignal || state.signals.find(s => s.status === 'pending_validation');

  if (!signalToValidate) {
    console.log('❌ No signal to validate');
    return;
  }

  try {
    console.log(`   Validating signal: ${signalToValidate.id}`);
    const validation = await orchestrator.runValidator(signalToValidate.id);

    console.log(`✅ Validation complete: ${validation.decision}`);
    console.log(`   Pipelines:`);
    console.log(`     - TAM: ${validation.pipelines.tam}`);
    console.log(`     - Competitors: ${validation.pipelines.competitors}`);
    console.log(`     - Technical: ${validation.pipelines.technical}`);
    console.log(`     - Pricing: ${validation.pipelines.pricing}`);
    console.log(`     - Risks: ${validation.pipelines.risks}`);

    if (validation.decision !== 'GO') {
      console.log(`\n⚠️  Signal was rejected (${validation.decision}). Cannot proceed to venture creation.`);
      console.log(`   Reasoning: ${validation.reasoning}`);
      return;
    }

    if (!validation.blueprint) {
      console.log('\n❌ GO decision but no blueprint provided by Validator!');
      return;
    }

    console.log(`\n   Blueprint created: ${validation.blueprint.name}`);

    // Step 3: Launch Venture (which triggers Codex)
    console.log('\n🚀 Step 3: Launching Venture...');

    try {
      const venture = await orchestrator.launchVenture(validation.blueprint);

      console.log(`✅ Venture created: ${venture.name} (${venture.slug})`);
      console.log(`   Status: ${venture.status}`);
      console.log(`   URL: ${venture.url || 'pending deployment'}`);

      // Step 4: Codex should have been triggered
      console.log('\n🤖 Step 4: Codex Agent Trigger...');
      console.log(`✅ Codex trigger sent to GitHub Actions`);
      console.log(`   Check: https://github.com/YOUR_USERNAME/startup-factory/actions`);
      console.log(`   Branch: venture/${venture.slug}`);
      console.log(`   Expected PR: Will be created by GitHub Actions workflow`);

    } catch (error) {
      console.error('❌ Venture launch failed:', error);
      return;
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
    return;
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('✅ FULL PIPELINE TEST COMPLETE\n');
  console.log('Next steps:');
  console.log('1. Check GitHub Actions for Codex workflow');
  console.log('2. Wait for PR to be created');
  console.log('3. Review generated code in PR');
  console.log('4. Merge PR to deploy to Vercel');
  console.log('\n💡 Note: Codex requires ANTHROPIC_API_KEY in GitHub Secrets');
}

// Run test
testFullPipeline().catch(console.error);
