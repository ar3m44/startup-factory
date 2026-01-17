# Codex Agent - Setup & Usage

Codex Agent is the autonomous code generation component of Factory OS. It uses GPT-4 via the OpenAI API to generate complete Next.js applications based on venture blueprints.

## Architecture

```
Orchestrator
    ↓
launchVenture()
    ↓
CodexAgent.triggerCodeGeneration()
    ↓
GitHub Actions (repository_dispatch)
    ↓
codex-runner.ts (runs in CI)
    ↓
Claude API (generates code)
    ↓
Create files, commit, push
    ↓
Create Pull Request
    ↓
CI checks pass
    ↓
Auto-merge (optional)
    ↓
Vercel Deploy
```

## Setup Instructions

### 1. GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

#### Required:
- `OPENAI_API_KEY` - Your OpenAI API key
  - Get it from: https://platform.openai.com/api-keys
  - Example: `sk-proj-...` or `sk-...`

#### Optional (for PR creation):
- `GITHUB_TOKEN` - Auto-provided by GitHub Actions
  - No action needed, GitHub provides this automatically

### 2. Environment Variables

For local testing, create `.env.local`:

```bash
OPENAI_API_KEY=sk-proj-... # или sk-...
GITHUB_TOKEN=ghp_...  # Optional, for local PR testing
GITHUB_REPOSITORY=your-username/startup-factory
```

### 3. Install Dependencies

```bash
npm install openai
npm install -g tsx  # For running TypeScript scripts
```

### 4. Verify Setup

Test that Codex can run locally:

```bash
# Create a test task file
mkdir -p scripts/tasks

# Run Codex test (will fail without ANTHROPIC_API_KEY)
npm run codex:test
```

## How It Works

### Automatic Flow (Production)

1. **Validator approves signal** → Returns GO decision with blueprint
2. **Orchestrator calls launchVenture()** → Creates venture in state.json
3. **CodexAgent.triggerCodeGeneration()** → Triggers GitHub Action via API
4. **GitHub Actions workflow starts** → Runs on Ubuntu
5. **codex-runner.ts executes**:
   - Creates git branch `venture/{slug}`
   - Reads system prompt and venture template
   - Calls Claude API with blueprint
   - Parses generated code (markdown format)
   - Creates files in `ventures/{slug}/`
   - Commits and pushes to branch
   - Creates Pull Request
6. **CI checks run** → TypeScript, ESLint, build
7. **Auto-merge (optional)** → If all checks pass
8. **Vercel deploys** → Venture goes live

### Manual Testing Flow

```bash
# Test Codex locally (without GitHub Actions)
npm run codex:generate -- \
  --ventureId="test-001" \
  --slug="test-venture" \
  --taskFile="scripts/tasks/test-task.md" \
  --branchName="venture/test-venture"
```

## File Structure

```
startup-factory/
├── scripts/
│   ├── codex-runner.ts           # Main runner script
│   ├── prompts/
│   │   └── codex-system.md       # System prompt for Claude
│   ├── templates/
│   │   └── venture-structure.md  # Expected file structure
│   └── tasks/                    # Task files (blueprints)
│       └── {ventureId}.md
├── .github/
│   └── workflows/
│       └── codex.yml             # GitHub Actions workflow
├── src/
│   └── lib/
│       └── agents/
│           └── codex.ts          # CodexAgent class
└── ventures/                     # Generated code goes here
    └── {slug}/
        ├── package.json
        ├── src/
        └── ...
```

## Codex Runner CLI

```bash
tsx scripts/codex-runner.ts [options]

Options:
  --ventureId       Venture ID (e.g., "vent-001")
  --slug            Venture slug (e.g., "quickpoll")
  --taskFile        Path to task/blueprint file
  --branchName      Git branch name (default: "venture/{slug}")

Environment Variables:
  ANTHROPIC_API_KEY     Required - Your Anthropic API key
  GITHUB_TOKEN          Optional - For PR creation
  GITHUB_REPOSITORY     Optional - For PR creation (format: "owner/repo")
```

## Task File Format

Task files (blueprints) are markdown files with venture specifications:

```markdown
# Venture: QuickPoll

## Overview
- **Name**: QuickPoll
- **Tagline**: Create polls in seconds
- **Problem**: Creating polls is too complicated
- **Solution**: Simple, fast poll creation with real-time results

## Target Metrics
- **Target MRR**: 5000₽
- **Target Users**: 500
- **Conversion Rate**: 10%

## Core Features
1. Poll creation (title + 2-5 options)
2. Unique voting links
3. Real-time results visualization
4. Share via link

## Tech Stack
- Next.js 16 + App Router
- Tailwind CSS v4
- Prisma + PostgreSQL (Supabase)
- Vercel Analytics

## Database Schema
\`\`\`prisma
model Poll {
  id        String   @id @default(cuid())
  title     String
  options   PollOption[]
  votes     Vote[]
  createdAt DateTime @default(now())
}

model PollOption {
  id     String @id @default(cuid())
  text   String
  pollId String
  poll   Poll   @relation(fields: [pollId], references: [id])
  votes  Vote[]
}

model Vote {
  id        String     @id @default(cuid())
  pollId    String
  optionId  String
  poll      Poll       @relation(fields: [pollId], references: [id])
  option    PollOption @relation(fields: [optionId], references: [id])
  createdAt DateTime   @default(now())
}
\`\`\`

## Pages
1. Landing page (/) - Poll creation form
2. Poll page (/poll/[id]) - Voting interface + results

## API Routes
- POST /api/polls - Create poll
- POST /api/vote - Submit vote
- GET /api/polls/[id] - Get poll results
```

## GitHub Actions Workflow

The workflow (`.github/workflows/codex.yml`) triggers when:

```yaml
on:
  repository_dispatch:
    types: [venture_approved]
```

It receives payload from CodexAgent:

```typescript
{
  ventureId: "vent-001",
  ventureName: "QuickPoll",
  slug: "quickpoll",
  blueprint: { /* full blueprint object */ },
  taskFile: "scripts/tasks/vent-001.md",
  branchName: "venture/quickpoll"
}
```

## Output Format

Codex generates code in markdown format with file blocks:

```markdown
## Generated Files

### File: package.json
\`\`\`json
{
  "name": "quickpoll",
  "version": "0.1.0"
}
\`\`\`

### File: src/app/page.tsx
\`\`\`tsx
export default function HomePage() {
  return <div>QuickPoll</div>;
}
\`\`\`
```

codex-runner.ts parses this and creates actual files.

## Monitoring

Check Codex execution:

1. **GitHub Actions**: Repository → Actions → "Codex Agent - Autonomous Code Generation"
2. **Pull Requests**: Check for new PRs with `venture/{slug}` branch
3. **Vercel**: Auto-deploy preview for each PR
4. **Logs**: GitHub Actions logs show full Codex output

## Troubleshooting

### Error: "ANTHROPIC_API_KEY is not set"
- Add secret to GitHub: Settings → Secrets → New repository secret
- For local: Add to `.env.local`

### Error: "Repository dispatch failed"
- Check GITHUB_TOKEN has `repo` permissions
- Verify repository name format: `owner/repo`

### Error: "Failed to parse generated code"
- Check Claude API response format
- Ensure system prompt is correct
- View full output in GitHub Actions logs

### Error: "PR creation failed"
- Ensure `gh` CLI is installed in GitHub Actions
- Check branch doesn't already exist
- Verify GitHub token permissions

## Cost Estimation

Claude Sonnet 4 pricing (as of Jan 2025):
- Input: $3 / million tokens
- Output: $15 / million tokens

Typical venture generation:
- Input: ~10,000 tokens (prompts + blueprint)
- Output: ~20,000 tokens (generated code)
- **Cost per venture**: ~$0.33

For 10 ventures/month: **~$3.30/month**

## Next Steps

1. ✅ Setup complete - Codex is ready
2. Run full pipeline test:
   ```bash
   # Start from Scout
   curl -X POST http://localhost:3000/api/scout

   # Validate signal
   curl -X POST http://localhost:3000/api/validator \
     -H "Content-Type: application/json" \
     -d '{"signalId": "sig-..."}'

   # Watch GitHub Actions for Codex trigger
   ```
3. Monitor first venture generation
4. Review generated code quality
5. Iterate on system prompt if needed

## Advanced Configuration

### Custom System Prompt

Edit `scripts/prompts/codex-system.md` to customize:
- Code style preferences
- Additional frameworks/libraries
- Specific patterns to follow
- Security requirements

### Venture Template

Edit `scripts/templates/venture-structure.md` to change:
- Default file structure
- Required dependencies
- Coding conventions
- File size limits

### Auto-merge

To enable auto-merge of Codex PRs:

```yaml
# Add to .github/workflows/codex.yml
- name: Enable auto-merge
  run: gh pr merge --auto --squash "$PR_NUMBER"
```

**⚠️ Warning**: Only enable after verifying Codex generates correct code consistently!

## Security Notes

- Codex generates code from AI - always review before deploying to production
- CI checks (TypeScript, ESLint, build) must pass before merge
- Consider adding automated tests in CI
- Rate limit API routes in generated code
- Validate environment variables on startup
- Use Dependabot for dependency updates

---

**Codex is ready!** 🤖

The autonomous code generation pipeline is fully configured. When a signal gets a GO decision, Codex will automatically generate the complete venture codebase and create a PR for review.
