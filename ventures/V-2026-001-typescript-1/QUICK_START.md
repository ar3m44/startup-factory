# Quick Start Guide - Continue.dev Code Generation

## Current Status
✅ Venture directory created: `/ventures/V-2026-001-typescript-1/`
✅ Instructions file ready: `VENTURE_INSTRUCTIONS.md`
✅ Continue.dev config created: `/.continue/config.json`
✅ VS Code opened in this directory

## Next Steps

### 1. Install Continue.dev Extension (if not installed)
1. In VS Code, open Extensions (⌘+Shift+X)
2. Search for "Continue"
3. Click Install on "Continue - Codestral, Claude, and more"
4. Reload VS Code if prompted

### 2. Configure OpenAI API Key
1. Open Continue sidebar (⌘+L or click Continue icon in sidebar)
2. Click the gear icon (⚙️) to open settings
3. Under "Models", find "GPT-4 Turbo"
4. Add your OpenAI API key in the `apiKey` field
5. Save the config

### 3. Start Code Generation

#### Option A: Use Custom Slash Command (Recommended)
1. Open Continue sidebar (⌘+L)
2. Type: `/venture`
3. Continue will read `VENTURE_INSTRUCTIONS.md` and start generating code

#### Option B: Manual Reference
1. Open Continue sidebar (⌘+L)
2. Type: `@VENTURE_INSTRUCTIONS.md generate the complete venture code following all instructions`
3. Press Enter

### 4. What Will Be Generated
Continue will create approximately 24 files:
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

## Troubleshooting

### Continue Extension Not Working
- Make sure you've added your OpenAI API key
- Try reloading VS Code (⌘+Shift+P → "Reload Window")
- Check Continue output panel for errors

### Generation Stops Midway
- GPT-4 has token limits, you may need to continue in chunks
- Use `/fix` command to fix any incomplete code
- Use `/feature` command to add missing features

### TypeScript Errors After Generation
1. Run: `npm run typecheck`
2. Use Continue: `/fix the TypeScript errors shown in the terminal`

## Alternative: GitHub Actions Method
If Continue.dev doesn't work, you can use GitHub Actions:
1. Add `OPENAI_API_KEY` to GitHub Secrets
2. Run workflow manually from: https://github.com/ar3m44/startup-factory/actions
3. Wait for PR to be created automatically

## Useful Commands
- `/venture` - Generate complete venture code
- `/fix` - Fix errors in generated code
- `/feature` - Add a new feature
- `⌘+L` - Open Continue sidebar
- `⌘+I` - Continue inline edit
- `⌘+Shift+R` - Continue refactor

---

**Ready to start?**
1. Open Continue sidebar (⌘+L)
2. Type `/venture`
3. Wait for code generation to complete!
