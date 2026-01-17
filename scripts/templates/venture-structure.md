# Venture Project Structure Template

This template defines the structure that Codex Agent should generate for each new venture.

## Directory Structure

```
ventures/
└── {slug}/
    ├── README.md                 # Project overview, setup instructions
    ├── package.json              # Dependencies, scripts
    ├── tsconfig.json             # TypeScript configuration
    ├── .env.example              # Environment variables template
    ├── src/
    │   ├── app/                  # Next.js App Router
    │   │   ├── layout.tsx
    │   │   ├── page.tsx          # Landing page
    │   │   ├── api/
    │   │   │   └── ...           # API routes
    │   │   └── globals.css
    │   ├── components/           # React components
    │   │   ├── UI/               # Base UI components
    │   │   ├── Features/         # Feature-specific components
    │   │   └── Layout/           # Layout components
    │   ├── lib/
    │   │   ├── db.ts             # Database client
    │   │   ├── auth.ts           # Authentication logic
    │   │   └── utils.ts          # Utility functions
    │   └── types/
    │       └── index.ts          # TypeScript types
    ├── public/
    │   ├── favicon.ico
    │   └── images/
    └── tests/
        └── ...                   # Test files
```

## Required Files

### 1. README.md
- Project name and tagline
- Problem statement
- Solution overview
- Setup instructions
- Tech stack
- Environment variables needed

### 2. package.json
**Required dependencies:**
- `next` (v16+)
- `react` (v19+)
- `react-dom` (v19+)
- `typescript`
- `@types/node`, `@types/react`, `@types/react-dom`
- `tailwindcss` (v4+)
- `@tailwindcss/postcss`

**Additional based on blueprint:**
- Database: `prisma` or `drizzle-orm`
- Auth: `next-auth` or `clerk`
- Payments: `stripe`
- Email: `resend` or `nodemailer`

**Scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit",
    "test": "vitest"
  }
}
```

### 3. src/app/layout.tsx
- Root layout with metadata
- Analytics setup (if needed)
- Font loading (Geist Sans/Mono)

### 4. src/app/page.tsx
- Landing page with:
  - Hero section (problem + solution)
  - Features section
  - Pricing (if applicable)
  - CTA buttons
  - Footer

### 5. src/app/globals.css
- Tailwind v4 imports
- Custom CSS variables matching Factory OS design system
- Base styles

### 6. src/components/UI/Button.tsx
- Variants: primary, secondary, ghost
- Sizes: sm, md, lg
- Loading state

### 7. src/lib/types/index.ts
- Core TypeScript types based on blueprint
- Database schema types
- API response types

### 8. .env.example
Template for environment variables:
```
# Database
DATABASE_URL=

# Auth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Analytics (optional)
NEXT_PUBLIC_GA_ID=

# Payments (if applicable)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Tech Stack Guidelines

### Frontend
- **Framework**: Next.js 16+ with App Router
- **Styling**: Tailwind CSS v4
- **TypeScript**: Strict mode enabled
- **Components**: Server Components by default, Client Components only when needed

### Backend
- **API Routes**: Next.js Route Handlers
- **Database**:
  - PostgreSQL (via Supabase or Neon) for complex data
  - SQLite (via Turso) for simple ventures
- **ORM**: Prisma or Drizzle ORM
- **Auth**: NextAuth.js or Clerk

### Infrastructure
- **Hosting**: Vercel (automatic from main branch)
- **Database**: Supabase/Neon (PostgreSQL) or Turso (SQLite)
- **Analytics**: Vercel Analytics
- **Monitoring**: Vercel Logs

## Code Generation Principles

1. **Minimal Viable Product**: Generate only essential features from blueprint
2. **Type Safety**: Full TypeScript coverage, no `any` types
3. **Responsive Design**: Mobile-first, works on all screen sizes
4. **Performance**: Server Components, optimized images, lazy loading
5. **SEO**: Proper metadata, semantic HTML, Open Graph tags
6. **Accessibility**: ARIA labels, keyboard navigation, semantic elements
7. **Error Handling**: Try-catch blocks, error boundaries, user-friendly messages
8. **Security**: Input validation, SQL injection prevention, CSRF protection
9. **Testing**: Basic unit tests for critical functions
10. **Documentation**: Clear comments for complex logic, README with setup

## Codex Prompt Structure

When generating code, Codex receives:

1. **System Prompt** (from `scripts/prompts/codex-system.md`)
2. **Venture Blueprint**:
   - Name, tagline, description
   - Target metrics (MRR, users, conversion)
   - Core features
   - Tech stack requirements
   - Design preferences
3. **This Structure Template**
4. **Task-Specific Instructions**

## Example Output

For a venture "QuickPoll" (simple polling tool):

```
ventures/quickpoll/
├── README.md               # "QuickPoll - Create polls in seconds"
├── package.json            # Next.js 16, React 19, Tailwind 4, Prisma
├── tsconfig.json
├── .env.example
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx        # Landing page with poll creation
│   │   ├── poll/
│   │   │   └── [id]/
│   │   │       └── page.tsx  # Poll voting page
│   │   ├── api/
│   │   │   ├── polls/
│   │   │   │   └── route.ts  # Create poll
│   │   │   └── vote/
│   │   │       └── route.ts  # Submit vote
│   │   └── globals.css
│   ├── components/
│   │   ├── UI/
│   │   │   ├── Button.tsx
│   │   │   └── Card.tsx
│   │   └── Features/
│   │       ├── PollCreator.tsx
│   │       └── PollResults.tsx
│   ├── lib/
│   │   ├── db.ts           # Prisma client
│   │   └── utils.ts
│   └── types/
│       └── index.ts        # Poll, Vote, PollOption types
├── prisma/
│   └── schema.prisma       # Poll, Vote, PollOption models
└── public/
    └── favicon.ico
```

## File Count Limits

- **Maximum files per venture**: 50
- **Maximum file size**: 5000 lines
- **Total codebase size**: ~10,000 lines max

Keep ventures focused and minimal!
