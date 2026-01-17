# Task: Build Веб-сервис: загружаешь TypeScript файлы → получаешь красивую интерактивную документацию за 1 минуту

**Venture ID**: V-2026-001-typescript-1
**Slug**: typescript-1
**Track**: FAST
**Target MRR**: 10,000₽
**Estimated Time**: 5 дней

---

## 🎯 Objective

Create a fully functional MVP Next.js application for:

**"Веб-сервис: загружаешь TypeScript файлы → получаешь красивую интерактивную документацию за 1 минуту"**

Разработчики хотят быстро создавать API документацию из TypeScript кода без сложных инструментов

---

## 📋 Requirements

### Core Features
1. Автоматический парсинг TypeScript → красивые docs
2. Интерактивный playground для тестирования API
3. Экспорт в HTML/PDF с брендингом

### Tech Stack
- Next.js 16
- TypeScript
- Tailwind CSS
- Vercel
- Stripe/YooKassa

### Pricing
- Model: subscription
- Price: 499₽/месяц
- Currency: RUB
- Payment Provider: YooKassa

---

## 🏗️ Implementation Guide

### 1. Landing Page
Create a compelling landing page at `src/app/page.tsx`:
- Hero section with value proposition
- Feature highlights (3 core features)
- Pricing section (499₽/месяц)
- CTA button (Sign up / Get Started)

### 2. Core Functionality
Implement the MVP features:
1. Автоматический парсинг TypeScript → красивые docs - create necessary components, API routes, and logic
2. Интерактивный playground для тестирования API - create necessary components, API routes, and logic
3. Экспорт в HTML/PDF с брендингом - create necessary components, API routes, and logic

### 3. Payment Integration
- Integrate YooKassa
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
- [ ] All 3 core features work
- [ ] Payment integration works (test mode)
- [ ] Analytics events tracked correctly
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Lighthouse score >90
- [ ] Deployed to Vercel successfully

---

## 🚨 Kill Criteria

- 0 транзакций за 14 дней
- <100 visits/день за 7 дней
- Negative unit economics после 30 дней

---

## 📝 Instructions for Codex

1. Read `factory/PROMPT_CODEX.md` for coding guidelines
2. Read `factory/PROMPT_DESIGNER.md` for UI/UX guidelines
3. Follow Next.js 16 best practices
4. Use TypeScript strict mode
5. Write clean, documented code
6. Create a PR when done
7. Include screenshots in PR description

---

**Created**: 2026-01-17T14:24:21.052Z
**Status**: pending_generation
