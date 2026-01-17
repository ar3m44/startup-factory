#!/usr/bin/env tsx
// ============================================================================
// CODEX LOCAL - Генерация кода через Continue.dev в VS Code
// ============================================================================

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

interface CodexLocalOptions {
  ventureId: string;
  taskFile: string;
}

/**
 * Codex Local - запуск генерации кода через Continue.dev
 *
 * Workflow:
 * 1. Читает task file
 * 2. Открывает VS Code с Continue.dev
 * 3. Continue генерирует код локально
 * 4. Вы можете сразу редактировать и тестировать
 */
class CodexLocal {
  private ventureId: string;
  private taskFile: string;
  private ventureDir: string;

  constructor(options: CodexLocalOptions) {
    this.ventureId = options.ventureId;
    this.taskFile = options.taskFile;
    this.ventureDir = path.join(process.cwd(), 'ventures', this.ventureId);
  }

  async run(): Promise<void> {
    console.log('🤖 Codex Local starting...');
    console.log(`📂 Venture: ${this.ventureId}`);
    console.log('');

    try {
      // 1. Create venture directory
      await this.createVentureDirectory();

      // 2. Read task file
      const taskContent = await this.readTaskFile();

      // 3. Create instructions file for Continue
      await this.createContinueInstructions(taskContent);

      // 4. Open VS Code with Continue
      await this.openVSCode();

      console.log('');
      console.log('✅ VS Code opened with Continue.dev');
      console.log('');
      console.log('📝 Next steps:');
      console.log('1. In VS Code, open Continue sidebar (Cmd+L or Ctrl+L)');
      console.log('2. Type: @VENTURE_INSTRUCTIONS.md');
      console.log('3. Press Enter to start generation');
      console.log('4. Continue will generate all files');
      console.log('5. Review and edit as needed');
      console.log('6. Run: npm run dev to test');
      console.log('7. Commit and push when ready');
      console.log('');

    } catch (error) {
      console.error('❌ Codex Local failed:', error);
      throw error;
    }
  }

  /**
   * Create venture directory
   */
  private async createVentureDirectory(): Promise<void> {
    console.log('📁 Creating venture directory...');
    await fs.mkdir(this.ventureDir, { recursive: true });
    console.log(`✅ Created: ${this.ventureDir}`);
  }

  /**
   * Read task file
   */
  private async readTaskFile(): Promise<string> {
    console.log('📖 Reading task file...');
    const taskPath = path.join(process.cwd(), this.taskFile);
    const content = await fs.readFile(taskPath, 'utf-8');
    console.log(`✅ Read: ${this.taskFile}`);
    return content;
  }

  /**
   * Create instructions file for Continue
   */
  private async createContinueInstructions(taskContent: string): Promise<void> {
    console.log('📝 Creating Continue instructions...');

    const systemPrompt = await this.readSystemPrompt();
    const ventureTemplate = await this.readVentureTemplate();

    const instructions = `# VENTURE GENERATION INSTRUCTIONS FOR CONTINUE.DEV

${systemPrompt}

## Venture Template Structure

${ventureTemplate}

## Task Specification

${taskContent}

## Instructions

1. Generate ALL files following the venture template structure
2. Use Next.js 16 App Router (not Pages Router)
3. Use TypeScript strict mode
4. Use Tailwind CSS v4
5. Make it production-ready with proper error handling
6. Include all core features from the task
7. Add payment integration if specified
8. Make it responsive and accessible

## Output Format

For each file, output:

\`\`\`filepath
path/to/file.tsx
\`\`\`

\`\`\`typescript
// file content here
\`\`\`

Start generating now!
`;

    const instructionsPath = path.join(this.ventureDir, 'VENTURE_INSTRUCTIONS.md');
    await fs.writeFile(instructionsPath, instructions);
    console.log(`✅ Created: ${instructionsPath}`);
  }

  /**
   * Read system prompt
   */
  private async readSystemPrompt(): Promise<string> {
    try {
      const promptPath = path.join(process.cwd(), 'scripts/prompts/codex-system.md');
      return await fs.readFile(promptPath, 'utf-8');
    } catch {
      return 'You are an expert Next.js developer generating production-ready code.';
    }
  }

  /**
   * Read venture template
   */
  private async readVentureTemplate(): Promise<string> {
    try {
      const templatePath = path.join(process.cwd(), 'scripts/templates/venture-structure.md');
      return await fs.readFile(templatePath, 'utf-8');
    } catch {
      return 'Follow standard Next.js 16 project structure.';
    }
  }

  /**
   * Open VS Code
   */
  private async openVSCode(): Promise<void> {
    console.log('🚀 Opening VS Code...');

    try {
      // Try to open with 'code' command
      execSync(`code "${this.ventureDir}"`, { stdio: 'ignore' });
    } catch {
      // If 'code' command not available, show manual instructions
      console.log('');
      console.log('⚠️  VS Code command not found');
      console.log('');
      console.log('📂 Venture directory created at:');
      console.log(`   ${this.ventureDir}`);
      console.log('');
      console.log('💡 Open this directory manually in VS Code:');
      console.log(`   1. Open VS Code`);
      console.log(`   2. File → Open Folder → ${this.ventureDir}`);
      console.log('   3. Install Continue.dev extension if not installed');
      console.log('   4. Follow the instructions above');
    }
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): CodexLocalOptions {
  const args = process.argv.slice(2);
  const options: Partial<CodexLocalOptions> = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];

    if (key && value) {
      options[key as keyof CodexLocalOptions] = value;
    }
  }

  if (!options.ventureId || !options.taskFile) {
    console.error('❌ Missing required arguments');
    console.log('');
    console.log('Usage:');
    console.log('  tsx scripts/codex-local.ts --ventureId <id> --taskFile <path>');
    console.log('');
    console.log('Example:');
    console.log('  tsx scripts/codex-local.ts \\');
    console.log('    --ventureId V-2026-001-typescript-1 \\');
    console.log('    --taskFile factory/tasks/V-2026-001-typescript-1.md');
    console.log('');
    process.exit(1);
  }

  return options as CodexLocalOptions;
}

/**
 * Main entry point
 */
async function main() {
  const options = parseArgs();
  const codex = new CodexLocal(options);
  await codex.run();
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
