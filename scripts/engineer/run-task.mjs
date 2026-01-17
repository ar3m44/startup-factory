#!/usr/bin/env node
// ============================================================================
// ENGINEER RUNNER - Executes TASK files using Claude API
// ============================================================================

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

/**
 * ENGINEER Runner - Executes TASK files
 *
 * Flow:
 * 1. Read TASK file from factory/tasks/
 * 2. Read PROMPT_ENGINEER.md
 * 3. Call Claude API with TASK content
 * 4. Parse response and apply changes
 * 5. Run checks (typecheck, build)
 * 6. Generate REPORT
 * 7. Create AUDIT entry
 * 8. Commit changes
 */
class EngineerRunner {
  constructor(taskId) {
    this.taskId = taskId;
    this.taskFile = path.join(PROJECT_ROOT, 'factory/tasks', `${taskId}.md`);
    this.branchName = `task/${taskId}`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    this.client = new Anthropic({ apiKey });
  }

  /**
   * Main execution
   */
  async run() {
    console.log(`🤖 ENGINEER starting task: ${this.taskId}`);
    console.log(`📂 Task file: ${this.taskFile}`);
    console.log(`🌿 Branch: ${this.branchName}\n`);

    try {
      // 1. Create git branch
      this.createBranch();

      // 2. Read TASK file
      console.log('📖 Reading TASK file...');
      const taskContent = await this.readTaskFile();

      // 3. Read PROMPT_ENGINEER
      console.log('📖 Reading PROMPT_ENGINEER...');
      const engineerPrompt = await this.readEngineerPrompt();

      // 4. Call Claude API
      console.log('🧠 Calling Claude API (Sonnet 4.5)...');
      const response = await this.callClaude(engineerPrompt, taskContent);

      // 5. Apply changes
      console.log('\n📝 Applying code changes...');
      const changes = await this.applyChanges(response);

      // 6. Run checks
      console.log('\n✅ Running checks...');
      const checks = await this.runChecks();

      // 7. Generate REPORT
      console.log('\n📄 Generating REPORT...');
      await this.generateReport(response, changes, checks);

      // 8. Create AUDIT entry
      console.log('📋 Creating AUDIT entry...');
      await this.createAudit(changes, checks);

      // 9. Commit and push
      if (checks.success) {
        console.log('\n💾 Committing changes...');
        this.commitChanges();

        console.log('🚀 Pushing to remote...');
        this.pushChanges();

        console.log('\n✅ ENGINEER completed successfully!');
        console.log(`📊 REPORT: factory/results/${this.taskId}-REPORT.md`);
      } else {
        console.log('\n❌ Checks failed - rolling back changes');
        this.rollback();
        console.log('📊 REPORT with errors: factory/results/${this.taskId}-REPORT.md');
      }

    } catch (error) {
      console.error('\n❌ ENGINEER failed:', error.message);
      await this.generateErrorReport(error);
      throw error;
    }
  }

  /**
   * Create git branch for task
   */
  createBranch() {
    try {
      execSync(`git checkout -b ${this.branchName}`, { stdio: 'inherit' });
    } catch (error) {
      // Branch might exist, checkout instead
      try {
        execSync(`git checkout ${this.branchName}`, { stdio: 'inherit' });
      } catch (checkoutError) {
        throw new Error(`Failed to create/checkout branch: ${checkoutError.message}`);
      }
    }
  }

  /**
   * Read TASK file
   */
  async readTaskFile() {
    try {
      const content = await fs.readFile(this.taskFile, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read TASK file: ${error.message}`);
    }
  }

  /**
   * Read PROMPT_ENGINEER
   */
  async readEngineerPrompt() {
    const promptPath = path.join(PROJECT_ROOT, 'factory/spec/PROMPT_ENGINEER.md');
    try {
      const content = await fs.readFile(promptPath, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read PROMPT_ENGINEER: ${error.message}`);
    }
  }

  /**
   * Call Claude API
   */
  async callClaude(systemPrompt, taskContent) {
    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Execute this TASK and generate the necessary code changes:

${taskContent}

Follow the output format specified in your system prompt. Generate complete, production-ready code.`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude API');
      }

      return content.text;
    } catch (error) {
      throw new Error(`Claude API call failed: ${error.message}`);
    }
  }

  /**
   * Apply code changes from Claude response
   */
  async applyChanges(response) {
    const { default: applyPatch } = await import('./apply-patch.mjs');
    return await applyPatch(response, PROJECT_ROOT);
  }

  /**
   * Run TypeScript and build checks
   */
  async runChecks() {
    const results = {
      typecheck: { passed: false, output: '' },
      build: { passed: false, output: '' },
      lint: { passed: false, output: '' },
      success: false,
    };

    // TypeScript check
    try {
      const output = execSync('npm run typecheck', {
        encoding: 'utf-8',
        cwd: PROJECT_ROOT
      });
      results.typecheck = { passed: true, output };
      console.log('  ✓ TypeScript check passed');
    } catch (error) {
      results.typecheck = { passed: false, output: error.stdout || error.message };
      console.log('  ✗ TypeScript check failed');
    }

    // Lint check
    try {
      const output = execSync('npm run lint', {
        encoding: 'utf-8',
        cwd: PROJECT_ROOT
      });
      results.lint = { passed: true, output };
      console.log('  ✓ Lint check passed');
    } catch (error) {
      results.lint = { passed: false, output: error.stdout || error.message };
      console.log('  ✗ Lint check failed');
    }

    // Build check
    try {
      const output = execSync('npm run build', {
        encoding: 'utf-8',
        cwd: PROJECT_ROOT
      });
      results.build = { passed: true, output };
      console.log('  ✓ Build check passed');
    } catch (error) {
      results.build = { passed: false, output: error.stdout || error.message };
      console.log('  ✗ Build check failed');
    }

    results.success = results.typecheck.passed && results.lint.passed && results.build.passed;

    return results;
  }

  /**
   * Generate REPORT file
   */
  async generateReport(response, changes, checks) {
    const { default: generateReport } = await import('./generate-report.mjs');
    await generateReport(this.taskId, response, changes, checks, PROJECT_ROOT);
  }

  /**
   * Create AUDIT entry
   */
  async createAudit(changes, checks) {
    const timestamp = new Date().toISOString();
    const auditFile = path.join(
      PROJECT_ROOT,
      'factory/audit',
      `AUDIT-${timestamp.split('T')[0]}-${this.taskId}.md`
    );

    const content = `# AUDIT ENTRY

**Date**: ${timestamp}
**Task**: ${this.taskId}
**Type**: ENGINEER
**Status**: ${checks.success ? 'SUCCESS' : 'FAILED'}

## Changes

- Created: ${changes.created.length} files
- Updated: ${changes.updated.length} files
- Deleted: ${changes.deleted.length} files

## Checks

- TypeScript: ${checks.typecheck.passed ? 'PASS' : 'FAIL'}
- Lint: ${checks.lint.passed ? 'PASS' : 'FAIL'}
- Build: ${checks.build.passed ? 'PASS' : 'FAIL'}

## Files Changed

${changes.created.map(f => `- CREATE: ${f}`).join('\n')}
${changes.updated.map(f => `- UPDATE: ${f}`).join('\n')}
${changes.deleted.map(f => `- DELETE: ${f}`).join('\n')}
`;

    await fs.writeFile(auditFile, content, 'utf-8');
    console.log(`  ✓ AUDIT entry created: ${path.basename(auditFile)}`);
  }

  /**
   * Commit changes
   */
  commitChanges() {
    execSync('git add .', { cwd: PROJECT_ROOT, stdio: 'inherit' });
    execSync(
      `git commit -m "feat: ${this.taskId}\n\nImplemented by ENGINEER (Claude Sonnet 4.5)\n\nCo-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"`,
      { cwd: PROJECT_ROOT, stdio: 'inherit' }
    );
  }

  /**
   * Push changes to remote
   */
  pushChanges() {
    execSync(`git push -u origin ${this.branchName}`, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit'
    });
  }

  /**
   * Rollback changes
   */
  rollback() {
    try {
      execSync('git reset --hard HEAD', { cwd: PROJECT_ROOT, stdio: 'inherit' });
      execSync('git checkout main', { cwd: PROJECT_ROOT, stdio: 'inherit' });
      execSync(`git branch -D ${this.branchName}`, { cwd: PROJECT_ROOT, stdio: 'inherit' });
      console.log('  ✓ Changes rolled back');
    } catch (error) {
      console.error('  ✗ Rollback failed:', error.message);
    }
  }

  /**
   * Generate error REPORT
   */
  async generateErrorReport(error) {
    const reportFile = path.join(
      PROJECT_ROOT,
      'factory/results',
      `${this.taskId}-REPORT.md`
    );

    const content = `# REPORT: ${this.taskId}

**Status**: FAILED
**Date**: ${new Date().toISOString()}
**Agent**: ENGINEER (Claude Sonnet 4.5)

## Error

\`\`\`
${error.message}
${error.stack}
\`\`\`

## Task File

${this.taskFile}

## Next Steps

1. Review error message above
2. Fix the issue manually or update TASK file
3. Re-run ENGINEER
`;

    await fs.mkdir(path.dirname(reportFile), { recursive: true });
    await fs.writeFile(reportFile, content, 'utf-8');
  }
}

// ============================================================================
// CLI Entry Point
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  // Parse --taskId argument
  let taskId;
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--taskId=')) {
      taskId = args[i].split('=')[1];
    } else if (args[i] === '--taskId') {
      taskId = args[i + 1];
    }
  }

  if (!taskId) {
    console.error('Usage: run-task.mjs --taskId=TASK-XXXX');
    process.exit(1);
  }

  const runner = new EngineerRunner(taskId);
  await runner.run();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
