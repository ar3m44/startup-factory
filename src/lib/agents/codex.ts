// ============================================================================
// CODEX AGENT - AI-powered code generation for ventures
// ============================================================================

import type { VentureBlueprint, Venture } from '../types';
import fs from 'fs/promises';
import path from 'path';

export interface CodexGenerationRequest {
  venture: Venture;
  blueprint: VentureBlueprint;
  taskDescription: string;
}

export interface CodexGenerationResult {
  success: boolean;
  prUrl?: string;
  branchName: string;
  error?: string;
}

/**
 * Codex Agent - генерирует код для ventures через GitHub Actions + Anthropic API
 *
 * Workflow:
 * 1. Orchestrator вызывает triggerCodeGeneration()
 * 2. Создаётся task file в factory/tasks/
 * 3. Отправляется webhook в GitHub Actions
 * 4. GitHub Action запускает codex-runner.ts
 * 5. Codex генерирует код через Anthropic API
 * 6. Создаётся PR автоматически
 * 7. CI проверяет код
 * 8. Auto-merge если всё ✅
 */
export class CodexAgent {
  private githubToken: string | undefined;
  private githubRepo: string | undefined;

  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN;
    this.githubRepo = process.env.GITHUB_REPOSITORY; // format: "owner/repo"
  }

  /**
   * Запустить генерацию кода для venture через GitHub Actions
   */
  async triggerCodeGeneration(
    request: CodexGenerationRequest
  ): Promise<CodexGenerationResult> {
    const { venture, blueprint } = request;

    console.log(`🤖 Codex Agent: Starting code generation for ${venture.name}...`);

    try {
      // 1. Создать task file для Codex
      const taskFile = await this.createTaskFile(venture, blueprint);
      console.log(`📝 Created task file: ${taskFile}`);

      // 2. Создать branch name
      const branchName = `venture/${venture.slug}`;

      // 3. Trigger GitHub Actions workflow
      if (this.githubToken && this.githubRepo) {
        await this.triggerGitHubAction({
          ventureId: venture.id,
          ventureName: venture.name,
          slug: venture.slug,
          blueprint,
          taskFile,
          branchName,
        });

        console.log(`🚀 GitHub Action triggered for ${venture.name}`);
        console.log(`📌 Branch: ${branchName}`);
        console.log(`⏳ Waiting for Codex to generate code...`);

        return {
          success: true,
          branchName,
          prUrl: `https://github.com/${this.githubRepo}/pull/new/${branchName}`,
        };
      } else {
        // Fallback: если нет GitHub token, просто создаём task file
        console.warn('⚠️  GitHub token not found, skipping GitHub Action trigger');
        console.log('💡 Task file created. Run manually: npm run codex:generate');

        return {
          success: true,
          branchName,
          error: 'GitHub integration not configured',
        };
      }
    } catch (error) {
      console.error('❌ Codex Agent failed:', error);
      return {
        success: false,
        branchName: `venture/${venture.slug}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Создать task file для Codex Agent
   */
  private async createTaskFile(
    venture: Venture,
    blueprint: VentureBlueprint
  ): Promise<string> {
    const taskPath = path.join(
      process.cwd(),
      'factory',
      'tasks',
      `${venture.id}.md`
    );

    const taskContent = `# Task: Build ${blueprint.name}

**Venture ID**: ${venture.id}
**Slug**: ${venture.slug}
**Track**: ${blueprint.metrics.track}
**Target MRR**: ${blueprint.metrics.targetMRR.toLocaleString()}₽
**Estimated Time**: ${blueprint.mvp.estimatedTime}

---

## 🎯 Objective

Create a fully functional ${blueprint.metrics.track === 'FAST' ? 'MVP' : 'production-ready'} Next.js application for:

**"${blueprint.name}"**

${blueprint.tagline}

---

## 📋 Requirements

### Core Features
${blueprint.mvp.coreFeatures.map((f, i) => `${i + 1}. ${f}`).join('\n')}

### Tech Stack
${blueprint.mvp.techStack.map(t => `- ${t}`).join('\n')}

### Pricing
- Model: ${blueprint.pricing.model}
- Price: ${blueprint.pricing.price}
- Currency: ${blueprint.pricing.currency}
- Payment Provider: ${blueprint.pricing.paymentProvider}

---

## 🏗️ Implementation Guide

### 1. Landing Page
Create a compelling landing page at \`src/app/page.tsx\`:
- Hero section with value proposition
- Feature highlights (${blueprint.mvp.coreFeatures.length} core features)
- Pricing section (${blueprint.pricing.price})
- CTA button (Sign up / Get Started)

### 2. Core Functionality
Implement the MVP features:
${blueprint.mvp.coreFeatures.map((f, i) => `${i + 1}. ${f} - create necessary components, API routes, and logic`).join('\n')}

### 3. Payment Integration
- Integrate ${blueprint.pricing.paymentProvider}
- Create checkout flow
- Handle successful/failed payments
- Store transactions in database (use Vercel Postgres or similar)

### 4. Analytics
- Track key events: page views, signups, purchases
- Use Vercel Analytics or Plausible
- Create admin dashboard to view metrics

### 5. Deployment Setup
- Configure Vercel deployment
- Set environment variables
- Test payment flow in test mode
- Verify analytics tracking

---

## 📊 Success Criteria

- [ ] Landing page loads and looks good
- [ ] All ${blueprint.mvp.coreFeatures.length} core features work
- [ ] Payment integration works (test mode)
- [ ] Analytics events tracked correctly
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Lighthouse score >90
- [ ] Deployed to Vercel successfully

---

## 🚨 Kill Criteria

${blueprint.metrics.killCriteria.map(k => `- ${k}`).join('\n')}

---

## 📝 Instructions for Codex

1. Read \`factory/PROMPT_CODEX.md\` for coding guidelines
2. Read \`factory/PROMPT_DESIGNER.md\` for UI/UX guidelines
3. Follow Next.js 16 best practices
4. Use TypeScript strict mode
5. Write clean, documented code
6. Create a PR when done
7. Include screenshots in PR description

---

**Created**: ${new Date().toISOString()}
**Status**: pending_generation
`;

    await fs.mkdir(path.dirname(taskPath), { recursive: true });
    await fs.writeFile(taskPath, taskContent, 'utf-8');

    return taskPath;
  }

  /**
   * Trigger GitHub Actions workflow через repository_dispatch
   */
  private async triggerGitHubAction(payload: {
    ventureId: string;
    ventureName: string;
    slug: string;
    blueprint: VentureBlueprint;
    taskFile: string;
    branchName: string;
  }): Promise<void> {
    if (!this.githubToken || !this.githubRepo) {
      throw new Error('GitHub token or repository not configured');
    }

    const [owner, repo] = this.githubRepo.split('/');

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${this.githubToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          event_type: 'venture_approved',
          client_payload: payload,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }
  }
}
