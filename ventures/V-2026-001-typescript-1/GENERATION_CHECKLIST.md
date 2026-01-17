# Venture Generation Checklist

## Venture: TypeScript Docs Generator
**ID**: V-2026-001-typescript-1
**Target MRR**: 10,000₽
**Status**: pending_generation

---

## Pre-Generation Setup
- [x] Venture directory created
- [x] VENTURE_INSTRUCTIONS.md created
- [x] Continue.dev config ready
- [ ] Continue.dev extension installed
- [ ] OpenAI API key configured

---

## Core Files to Generate

### Configuration Files
- [ ] `package.json` - Dependencies and scripts
- [ ] `tsconfig.json` - TypeScript strict mode
- [ ] `.env.example` - Environment variables
- [ ] `next.config.js` - Next.js configuration
- [ ] `tailwind.config.js` - Tailwind CSS v4

### App Structure
- [ ] `src/app/layout.tsx` - Root layout with metadata
- [ ] `src/app/page.tsx` - Landing page
- [ ] `src/app/globals.css` - Global styles with Tailwind

### Components
- [ ] `src/components/UI/Button.tsx` - Reusable button component
- [ ] `src/components/UI/Card.tsx` - Card component
- [ ] `src/components/Features/TypeScriptParser.tsx` - Upload and parse TS files
- [ ] `src/components/Features/InteractivePlayground.tsx` - Test API endpoints
- [ ] `src/components/Features/DocumentationViewer.tsx` - Show generated docs
- [ ] `src/components/Features/ExportPanel.tsx` - HTML/PDF export

### API Routes
- [ ] `src/app/api/parse/route.ts` - Parse TypeScript files
- [ ] `src/app/api/playground/route.ts` - Execute API test requests
- [ ] `src/app/api/export/route.ts` - Generate HTML/PDF exports
- [ ] `src/app/api/subscribe/route.ts` - YooKassa subscription
- [ ] `src/app/api/webhooks/yookassa/route.ts` - Payment webhooks

### Database & Types
- [ ] `prisma/schema.prisma` - Database schema (Users, Projects, Docs)
- [ ] `src/types/index.ts` - TypeScript types
- [ ] `src/lib/db.ts` - Prisma client
- [ ] `src/lib/yookassa.ts` - YooKassa integration
- [ ] `src/lib/parser.ts` - TypeScript AST parser
- [ ] `src/lib/exporter.ts` - HTML/PDF export logic

### Pages
- [ ] `src/app/dashboard/page.tsx` - User dashboard
- [ ] `src/app/project/[id]/page.tsx` - Project documentation page
- [ ] `src/app/pricing/page.tsx` - Pricing page

---

## Core Features Implementation

### Feature 1: TypeScript Parser
- [ ] File upload component
- [ ] TypeScript AST parsing (using typescript compiler API)
- [ ] Extract interfaces, types, functions, classes
- [ ] Generate documentation structure
- [ ] Store in database

### Feature 2: Interactive Playground
- [ ] API endpoint selector
- [ ] Request parameters form
- [ ] Execute request
- [ ] Display response
- [ ] Save test scenarios

### Feature 3: HTML/PDF Export
- [ ] Generate HTML with custom branding
- [ ] CSS styling for print/export
- [ ] PDF generation (using puppeteer or similar)
- [ ] Download functionality
- [ ] Custom logo/branding options

---

## Payment Integration
- [ ] YooKassa SDK setup
- [ ] Subscription plans (499₽/месяц)
- [ ] Checkout flow
- [ ] Payment success page
- [ ] Payment failure handling
- [ ] Webhook handling
- [ ] Subscription management

---

## Analytics
- [ ] Vercel Analytics setup
- [ ] Track page views
- [ ] Track file uploads
- [ ] Track exports
- [ ] Track subscriptions
- [ ] Admin dashboard for metrics

---

## Testing & Quality

### TypeScript
- [ ] `npm run typecheck` passes
- [ ] No `any` types
- [ ] Strict mode enabled

### Build
- [ ] `npm run build` succeeds
- [ ] No build errors
- [ ] Bundle size optimized

### Functionality
- [ ] Upload TypeScript file works
- [ ] Parser generates correct docs
- [ ] Playground executes requests
- [ ] Export generates HTML
- [ ] Export generates PDF
- [ ] Payment flow works (test mode)

### UI/UX
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Accessible (ARIA labels)
- [ ] Loading states for async operations
- [ ] Error messages clear and helpful
- [ ] SEO metadata present

---

## Deployment

### Vercel Setup
- [ ] Connect repository to Vercel
- [ ] Add environment variables
- [ ] Deploy to production
- [ ] Custom domain (optional)

### Environment Variables
- [ ] `DATABASE_URL` - PostgreSQL connection
- [ ] `YOOKASSA_SHOP_ID` - YooKassa shop ID
- [ ] `YOOKASSA_SECRET_KEY` - YooKassa secret key
- [ ] `NEXT_PUBLIC_APP_URL` - App URL for redirects
- [ ] `NEXTAUTH_SECRET` - Auth secret (if using NextAuth)

---

## Post-Deployment

### Testing in Production
- [ ] Landing page loads
- [ ] Upload works
- [ ] Parser generates docs
- [ ] Playground works
- [ ] Export works
- [ ] Payment flow works
- [ ] Analytics tracking works

### Performance
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals green
- [ ] No console errors
- [ ] Fast initial load (<3s)

---

## Success Criteria (from blueprint)
- [ ] Landing page loads and looks good
- [ ] All 3 core features work
- [ ] Payment integration works (test mode)
- [ ] Analytics events tracked correctly
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Lighthouse score >90
- [ ] Deployed to Vercel successfully

---

## Notes
- Start with `/venture` command in Continue.dev
- Generate in order: config → components → API → pages
- Test each feature after generation
- Use `/fix` for errors, `/feature` for additions

**Estimated time**: 2-3 hours with Continue.dev assistance
**Estimated cost**: ~$0.50 in OpenAI API calls (GPT-4 Turbo)
