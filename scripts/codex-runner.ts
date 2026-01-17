#!/usr/bin/env tsx
// ============================================================================
// CODEX RUNNER - Генерирует код для venture через Anthropic API
// ============================================================================

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

interface CodexRunnerOptions {
  ventureId: string;
  slug: string;
  taskFile: string;
  branchName: string;
}

/**
 * Codex Runner - запускается через GitHub Actions
 *
 * Workflow:
 * 1. Читает task file из factory/tasks/
 * 2. Читает PROMPT_CODEX.md и PROMPT_DESIGNER.md
 * 3. Вызывает Anthropic API для генерации кода
 * 4. Парсит ответ и создаёт файлы
 * 5. Делает git commit + push
 * 6. Создаёт Pull Request
 */
class CodexRunner {
  private client: Anthropic;
  private ventureId: string;
  private slug: string;
  private taskFile: string;
  private branchName: string;
  private ventureDir: string;

  constructor(options: CodexRunnerOptions) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    this.client = new Anthropic({ apiKey });
    this.ventureId = options.ventureId;
    this.slug = options.slug;
    this.taskFile = options.taskFile;
    this.branchName = options.branchName;
    this.ventureDir = path.join(process.cwd(), 'ventures', this.ventureId);
  }

  /**
   * Main execution
   */
  async run(): Promise<void> {
    console.log('🤖 Codex Runner starting...');
    console.log(`📂 Venture: ${this.ventureId}`);
    console.log(`🌿 Branch: ${this.branchName}`);

    try {
      // 1. Создать git branch
      this.createBranch();

      // 2. Прочитать промпты и task
      const systemPrompt = await this.buildSystemPrompt();
      const taskContent = await fs.readFile(this.taskFile, 'utf-8');

      console.log('📖 Reading prompts and task...');

      // 3. Вызвать Claude API для генерации кода
      console.log('🧠 Calling Claude API...');
      const generatedCode = await this.generateCode(systemPrompt, taskContent);

      // 4. Создать файлы
      console.log('📝 Creating files...');
      await this.createFiles(generatedCode);

      // 5. Commit и push
      console.log('💾 Committing changes...');
      this.commitAndPush();

      // 6. Создать PR
      console.log('🔀 Creating Pull Request...');
      await this.createPullRequest();

      console.log('✅ Codex Runner completed successfully!');
    } catch (error) {
      console.error('❌ Codex Runner failed:', error);
      throw error;
    }
  }

  /**
   * Создать git branch
   */
  private createBranch(): void {
    try {
      execSync(`git checkout -b ${this.branchName}`, { stdio: 'inherit' });
    } catch (error) {
      // Branch might already exist
      execSync(`git checkout ${this.branchName}`, { stdio: 'inherit' });
    }
  }

  /**
   * Собрать system prompt из промптов
   */
  private async buildSystemPrompt(): Promise<string> {
    const codexPrompt = await fs.readFile(
      path.join(process.cwd(), 'factory', 'PROMPT_CODEX.md'),
      'utf-8'
    );

    const designerPrompt = await fs.readFile(
      path.join(process.cwd(), 'factory', 'PROMPT_DESIGNER.md'),
      'utf-8'
    );

    return `${codexPrompt}

---

${designerPrompt}

---

## Additional Instructions

You are generating code for a venture in Factory OS. Your output should be:

1. **File-based**: Each code snippet should be a complete file
2. **Production-ready**: No TODOs, no placeholders, fully functional code
3. **Well-structured**: Follow Next.js 16 App Router conventions
4. **Type-safe**: Use TypeScript strict mode
5. **Styled**: Use Tailwind CSS, modern design (similar to Vercel/Linear)

## Output Format

For each file you create, use this format:

\`\`\`filepath
src/app/page.tsx
\`\`\`

\`\`\`typescript
// File content here
\`\`\`

Make sure to create ALL necessary files for a working MVP.
`;
  }

  /**
   * Генерировать код через Claude API
   */
  private async generateCode(
    systemPrompt: string,
    taskContent: string
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${taskContent}

Generate all necessary files for this venture. Include:
- Landing page (src/app/page.tsx)
- Core feature components
- API routes for functionality
- Payment integration
- Analytics setup
- README.md

Output each file using the specified format.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    return content.text;
  }

  /**
   * Парсить сгенерированный код и создать файлы
   */
  private async createFiles(generatedCode: string): Promise<void> {
    // Regex для извлечения файлов из ответа Claude
    const fileRegex = /```filepath\n(.+?)\n```\n\n```(\w+)\n([\s\S]+?)```/g;

    let match;
    const files: Array<{ path: string; content: string }> = [];

    while ((match = fileRegex.exec(generatedCode)) !== null) {
      const filePath = match[1].trim();
      const content = match[3].trim();
      files.push({ path: filePath, content });
    }

    if (files.length === 0) {
      console.warn('⚠️  No files found in generated code. Using fallback parsing...');
      // Fallback: попробовать найти любые code blocks
      const codeBlockRegex = /```(?:\w+)?\n([\s\S]+?)```/g;
      let blockMatch;
      let fileIndex = 0;

      while ((blockMatch = codeBlockRegex.exec(generatedCode)) !== null) {
        files.push({
          path: `src/generated-${fileIndex++}.tsx`,
          content: blockMatch[1].trim()
        });
      }
    }

    console.log(`📦 Creating ${files.length} files...`);

    // Создать директорию venture если её нет
    await fs.mkdir(this.ventureDir, { recursive: true });

    // Создать каждый файл
    for (const file of files) {
      const fullPath = path.join(this.ventureDir, file.path);
      const dir = path.dirname(fullPath);

      // Создать директорию если нужно
      await fs.mkdir(dir, { recursive: true });

      // Записать файл
      await fs.writeFile(fullPath, file.content, 'utf-8');
      console.log(`  ✓ ${file.path}`);
    }

    // Создать базовый README если его нет
    const readmePath = path.join(this.ventureDir, 'README.md');
    try {
      await fs.access(readmePath);
    } catch {
      await fs.writeFile(
        readmePath,
        `# ${this.ventureId}\n\nGenerated by Factory OS Codex Agent\n`,
        'utf-8'
      );
      console.log('  ✓ README.md');
    }
  }

  /**
   * Commit и push изменения
   */
  private commitAndPush(): void {
    execSync('git add .', { stdio: 'inherit' });
    execSync(
      `git commit -m "feat: Generate code for venture ${this.ventureId}\n\nCo-Authored-By: Codex Agent <noreply@factory-os.dev>"`,
      { stdio: 'inherit' }
    );
    execSync(`git push -u origin ${this.branchName}`, { stdio: 'inherit' });
  }

  /**
   * Создать Pull Request через GitHub CLI
   */
  private async createPullRequest(): Promise<void> {
    const title = `feat: Add venture ${this.slug}`;
    const body = `## 🚀 New Venture: ${this.ventureId}

This PR was automatically generated by **Codex Agent**.

### 📋 Task
See \`${this.taskFile}\`

### 🤖 Generated Files
Check the commits for all generated files.

### ✅ Checklist
- [ ] Code compiles without errors
- [ ] Tests pass (if any)
- [ ] Lint passes
- [ ] Ready for deployment

---

🤖 Generated with Factory OS Codex Agent
`;

    execSync(
      `gh pr create --title "${title}" --body "${body}" --base main --head ${this.branchName}`,
      { stdio: 'inherit' }
    );
  }
}

// ============================================================================
// CLI Entry Point
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const options: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const [key, value] = args[i].substring(2).split('=');
      options[key] = value || args[i + 1];
      if (!args[i].includes('=')) i++;
    }
  }

  const { ventureId, slug, taskFile, branchName } = options;

  if (!ventureId || !slug || !taskFile || !branchName) {
    console.error('Usage: codex-runner --ventureId=<id> --slug=<slug> --taskFile=<path> --branchName=<branch>');
    process.exit(1);
  }

  const runner = new CodexRunner({
    ventureId,
    slug,
    taskFile,
    branchName,
  });

  await runner.run();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { CodexRunner };
