# Quick Start Guide - Continue.dev Code Generation with Claude

## Current Status
✅ Venture directory created: `/ventures/V-2026-001-typescript-1/`
✅ Instructions file ready: `VENTURE_INSTRUCTIONS.md`
✅ Continue.dev config created: `/.continue/config.json` (Claude Sonnet 4.5)
✅ VS Code opened in this directory

## Next Steps

### 1. Install Continue.dev Extension (if not installed)
1. In VS Code, open Extensions (⌘+Shift+X)
2. Search for "Continue"
3. Click Install on "Continue - Codestral, Claude, and more"
4. Reload VS Code if prompted

### 2. Configure Anthropic API Key
1. Open Continue sidebar (⌘+L or click Continue icon in sidebar)
2. Click the gear icon (⚙️) to open settings
3. Under "Models", find "Claude Sonnet 4.5"
4. Add your Anthropic API key in the `apiKey` field
   - **Important**: Use the SAME API key that you use in Claude chat
   - Format: `sk-ant-api03-...`
   - Get it from: https://console.anthropic.com/settings/keys
5. Save the config

### 3. Start Code Generation

#### Option A: Use Custom Slash Command (Recommended)
1. Open Continue sidebar (⌘+L)
2. Type: `/venture`
3. Continue will read `VENTURE_INSTRUCTIONS.md` and start generating code with Claude Sonnet 4.5

#### Option B: Manual Reference
1. Open Continue sidebar (⌘+L)
2. Type: `@VENTURE_INSTRUCTIONS.md generate the complete venture code following all instructions`
3. Press Enter

### 4. What Will Be Generated
Continue with Claude will create approximately 24 files:
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.env.example` - Environment variables template
- `src/app/page.tsx` - Landing page
- `src/app/layout.tsx` - Root layout
- `src/app/api/` - API routes for core features
- `src/components/` - Reusable React components
- `src/lib/` - Utilities and database client
- `src/types/` - TypeScript types
- `prisma/schema.prisma` - Database schema

### 5. Core Features to Implement
1. **TypeScript Parser** - Upload TS files → generate docs
2. **Interactive Playground** - Test API endpoints
3. **HTML/PDF Export** - Export docs with branding
4. **YooKassa Integration** - 499₽/month subscription
5. **Analytics** - Track usage metrics

### 6. After Generation
1. Install dependencies: `npm install`
2. Set up environment variables: `cp .env.example .env`
3. Run database migrations: `npx prisma migrate dev`
4. Start dev server: `npm run dev`
5. Open http://localhost:3000

## Why Claude Sonnet 4.5?

**Advantages over GPT-4**:
- ✅ **Better code quality** - Fewer bugs, more consistent
- ✅ **Larger context** - 200K tokens vs 128K
- ✅ **Cheaper** - $0.33 per venture vs $0.70
- ✅ **You already have it** - Same API key as this chat
- ✅ **Faster** - Optimized for code generation

**Cost per venture**: ~$0.33
- Input: ~10,000 tokens × $3/1M = $0.03
- Output: ~20,000 tokens × $15/1M = $0.30

## Troubleshooting

### Continue Extension Not Working
- Make sure you've added your Anthropic API key (starts with `sk-ant-`)
- Try reloading VS Code (⌘+Shift+P → "Reload Window")
- Check Continue output panel for errors
- Verify your API key has credits: https://console.anthropic.com/

### Generation Stops Midway
- Claude has large context (200K tokens), but very large files may need splitting
- Use `/fix` command to fix any incomplete code
- Use `/feature` command to add missing features

### TypeScript Errors After Generation
1. Run: `npm run typecheck`
2. Use Continue: `/fix the TypeScript errors shown in the terminal`

### API Key Issues
**Error**: "Authentication error"
**Fix**:
- Make sure you're using Anthropic API key (not OpenAI)
- Key format: `sk-ant-api03-...` (not `sk-proj-...`)
- Get it from: https://console.anthropic.com/settings/keys
- Same key you use for Claude chat

## Alternative: GitHub Actions Method
If Continue.dev doesn't work, you can use GitHub Actions:
1. Add `ANTHROPIC_API_KEY` to GitHub Secrets (same key)
2. Run workflow manually from: https://github.com/ar3m44/startup-factory/actions
3. Wait for PR to be created automatically

## Useful Commands
- `/venture` - Generate complete venture code
- `/fix` - Fix errors in generated code
- `/feature` - Add a new feature
- `⌘+L` - Open Continue sidebar
- `⌘+I` - Continue inline edit
- `⌘+Shift+R` - Continue refactor

## Available Models in Continue

1. **Claude Sonnet 4.5** ⭐ (Recommended)
   - Best for: Complete code generation
   - Context: 200K tokens
   - Cost: $0.33 per venture

2. **Claude Sonnet 3.5**
   - Best for: Quick fixes and smaller tasks
   - Context: 200K tokens
   - Cost: Slightly cheaper

3. **Claude Opus 4.5**
   - Best for: Complex refactoring
   - Context: 200K tokens
   - Cost: Higher, use for special cases

---

**Ready to start?**
1. Open Continue sidebar (⌘+L)
2. Make sure Anthropic API key is configured
3. Type `/venture`
4. Wait for Claude to generate your code!

💡 **Pro tip**: Claude Sonnet 4.5 is the same model you're chatting with right now, so the code quality will be excellent!
