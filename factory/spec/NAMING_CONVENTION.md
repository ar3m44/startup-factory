# NAMING_CONVENTION.md — Правила именования

## Общие принципы
- Имена должны быть понятными без контекста
- Используй английский для кода, русский для документации
- Consistency > Creativity (консистентность важнее креативности)

---

## 1. Ventures (продукты)

### Формат: `V-YYYY-NNN-slug`

**Компоненты:**
- `V-` — префикс (Venture)
- `YYYY` — год запуска (2025, 2026)
- `NNN` — порядковый номер (001, 002, ..., 999)
- `slug` — короткое имя продукта (lowercase, дефисы)

**Примеры:**
```
V-2025-001-quickpoll        ✅ Первый продукт 2025 года
V-2025-002-instant-cv       ✅ Второй продукт 2025 года
V-2026-001-mood-tracker     ✅ Первый продукт 2026 года
```

**Правила для slug:**
- Только латиница
- Только lowercase
- Разделитель: дефис `-`
- Длина: 2-20 символов
- Должен отражать суть продукта

**Плохие примеры:**
```
quickPoll                   ❌ Нет префикса и номера
V-2025-1-quickpoll          ❌ Номер не дополнен нулями
V-2025-001-QuickPoll        ❌ Не lowercase
V-2025-001-quick_poll       ❌ Underscore вместо дефиса
```

### Директория продукта
```
ventures/V-YYYY-NNN-slug/
  README.md                 — описание продукта
  METRICS.md                — метрики и KPI
  RISKS.md                  — риски и митигация
  .env.example              — пример env переменных
```

---

## 2. Tasks (задачи для Codex)

### Формат: `TASK-XXXX`

**Компоненты:**
- `TASK-` — префикс
- `XXXX` — порядковый номер (0001, 0002, ..., 9999)

**Примеры:**
```
TASK-0001.md                ✅
TASK-0042.md                ✅
TASK-1337.md                ✅
```

**Правила:**
- Номер всегда 4 цифры (с ведущими нулями)
- Нумерация сквозная (не привязана к венчурам)
- Файл задачи: `factory/tasks/TASK-XXXX.md`

**Плохие примеры:**
```
TASK-1.md                   ❌ Номер не дополнен нулями
task-0001.md                ❌ Префикс не uppercase
TASK_0001.md                ❌ Underscore вместо дефиса
```

---

## 3. Reports (отчёты Codex)

### Формат: `REPORT-XXXX`

**Компоненты:**
- `REPORT-` — префикс
- `XXXX` — номер совпадает с номером TASK

**Примеры:**
```
REPORT-0001.md              ✅ Отчёт по TASK-0001
REPORT-0042.md              ✅ Отчёт по TASK-0042
```

**Правила:**
- Номер совпадает с TASK-XXXX
- Файл отчёта: `factory/results/REPORT-XXXX.md`

---

## 4. Git branches

### Форматы:
- `feat/task-xxxx` — новая функциональность
- `fix/task-xxxx` — исправление бага
- `docs/task-xxxx` — изменения документации
- `refactor/task-xxxx` — рефакторинг
- `chore/task-xxxx` — обслуживание (зависимости, конфиги)

**Примеры:**
```
feat/task-0001              ✅ Новая фича по TASK-0001
fix/task-0042               ✅ Исправление бага по TASK-0042
docs/task-0100              ✅ Обновление документации
```

**Правила:**
- Префикс тип изменения (feat, fix, docs, refactor, chore)
- Номер задачи lowercase (task-xxxx, не TASK-XXXX)
- Всегда привязано к задаче

**Плохие примеры:**
```
feature/task-0001           ❌ Префикс должен быть короткий (feat)
feat/TASK-0001              ❌ TASK должен быть lowercase
feat/add-new-feature        ❌ Не привязано к номеру задачи
```

---

## 5. Commit messages

### Формат: `TYPE-XXXX: Short description`

**Примеры:**
```
TASK-0001: Initialize Next.js project           ✅
TASK-0042: Add payment integration              ✅
TASK-0100: Update README with setup guide       ✅
```

**Правила:**
- Начинается с `TASK-XXXX:`
- Описание на английском
- Глагол в повелительном наклонении (Add, Fix, Update)
- Длина: до 72 символов
- Краткое, но понятное описание

**Плохие примеры:**
```
Added payment integration   ❌ Нет номера задачи
TASK-0042 add payment       ❌ Нет двоеточия, lowercase
task-0042: Add payment      ❌ task должен быть uppercase
```

---

## 6. Pull Requests

### Формат заголовка: `TASK-XXXX: Short description`

**Примеры:**
```
TASK-0001: Initialize Next.js project           ✅
TASK-0042: Add payment integration              ✅
```

**Правила:**
- Совпадает с commit message
- Описание PR может быть подробнее (в теле PR)

---

## 7. Файлы и директории

### TypeScript/JavaScript файлы
```
components/Hero.tsx         ✅ PascalCase для компонентов
lib/utils.ts                ✅ camelCase для утилит
app/page.tsx                ✅ lowercase для Next.js routes
hooks/useAuth.ts            ✅ camelCase с префиксом use
types/user.ts               ✅ camelCase для типов
```

### Markdown файлы
```
README.md                   ✅ Uppercase для документации
TASK-0001.md                ✅ Uppercase для задач
REPORT-0001.md              ✅ Uppercase для отчётов
```

### Директории
```
factory/                    ✅ lowercase
ventures/                   ✅ lowercase
src/app/                    ✅ lowercase
src/components/             ✅ lowercase
```

---

## 8. Переменные в коде

### TypeScript/JavaScript
```typescript
// Константы: UPPER_SNAKE_CASE
const MAX_RETRIES = 3
const API_BASE_URL = "https://api.example.com"

// Переменные: camelCase
const userId = "123"
const isAuthenticated = true

// Функции: camelCase
function getUserById(id: string) { ... }
function handleSubmit() { ... }

// Компоненты: PascalCase
function HeroSection() { ... }
function PaymentForm() { ... }

// Типы/Интерфейсы: PascalCase
type User = { ... }
interface PaymentData { ... }

// Enums: PascalCase для типа, UPPER_SNAKE_CASE для значений
enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}
```

### Environment variables
```bash
# Публичные (Next.js): NEXT_PUBLIC_
NEXT_PUBLIC_API_URL=...
NEXT_PUBLIC_STRIPE_KEY=...

# Приватные: SCREAMING_SNAKE_CASE
DATABASE_URL=...
STRIPE_SECRET_KEY=...
```

---

## Чеклист именования

- [ ] Venture ID следует формату `V-YYYY-NNN-slug`
- [ ] Task ID следует формату `TASK-XXXX`
- [ ] Branch следует формату `feat/task-xxxx`
- [ ] Commit message следует формату `TASK-XXXX: Description`
- [ ] PR заголовок совпадает с commit message
- [ ] Файлы компонентов в PascalCase
- [ ] Файлы утилит в camelCase
- [ ] Константы в UPPER_SNAKE_CASE
- [ ] TypeScript типы в PascalCase

---

**Главное правило**: Если сомневаешься — посмотри на существующие примеры.
