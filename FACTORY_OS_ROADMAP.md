# FACTORY OS - ORCHESTRATOR ANALYSIS & ROADMAP

**Date**: 2026-01-17
**Репозиторий**: https://github.com/ar3m44/startup-factory
**Стратегия**: B2C РФ/Москва, landing-first
**Изменение**: Claude API вместо Codex-инженера

---

## 📊 CURRENT_STATE

### ✅ ЧТО СДЕЛАНО ПРАВИЛЬНО

**Структура репозитория**:
- ✅ `factory/` - централизованная папка для всех specs/templates
- ✅ `factory/spec/` - промпты для агентов (Scout, Validator, Launcher, Monitor)
- ✅ `factory/tasks/` - TASK файлы для ventures
- ✅ `factory/audit/` - AUDIT записи
- ✅ `factory/results/` - REPORT файлы
- ✅ `factory/state.json` - единый state ventures/signals
- ✅ `ventures/` - отдельные папки для каждого venture

**CI/CD**:
- ✅ `.github/workflows/ci.yml` - базовый CI (lint, typecheck, build)
- ✅ `.github/workflows/codex.yml` - workflow для Claude API генерации
- ✅ Vercel подключён для auto-deploy из main

**Шаблоны и стандарты**:
- ✅ `TASK_TEMPLATE.md`, `REPORT_TEMPLATE.md`, `AUDIT_ENTRY_TEMPLATE.md`
- ✅ `DEFINITION_OF_DONE.md`, `NAMING_CONVENTION.md`
- ✅ `MASTER_PROMPT.md` - общий контекст для Factory OS

**Агенты**:
- ✅ Scout, Validator, Launcher, Monitor - промпты готовы в `factory/spec/`
- ✅ Claude Sonnet 4.5 интегрирован для code generation
- ✅ Orchestrator (`src/lib/orchestrator.ts`) - управление пайплайном

### ❌ ЧТО НЕ СООТВЕТСТВУЕТ СТАНДАРТУ

**1. Структура factory/ частично хаотична**:
- ❌ Промпты размазаны: `factory/PROMPT_CODEX.md` лежит в корне VS `factory/spec/PROMPT_SCOUT.md`
- ❌ Нет `factory/spec/PROMPT_ORCHESTRATOR.md` (промпт для оркестратора)
- ❌ Нет `factory/spec/PROMPT_ENGINEER.md` (Claude API as engineer)
- ❌ Нет `factory/templates/` папки (шаблоны лежат в корне factory/)
- ❌ Документация в корне проекта вместо `docs/`

**2. Инженерный контур (ENGINEER) отсутствует**:
- ❌ Нет автоматического TASK → execute → REPORT цикла
- ❌ `codex.yml` workflow не следует Factory OS стандарту (нет REPORT, нет AUDIT)
- ❌ Нет `scripts/engineer/run-task.mjs` runner
- ❌ Нет проверки DoD перед merge
- ❌ Нет генерации REPORT.md после выполнения задачи

**3. GitHub Actions не соответствуют стандарту**:
- ❌ Нет отдельного workflow для ENGINEER (сейчас только codex.yml для ventures)
- ❌ Нет auto-merge после прохождения checks
- ❌ Нет автоматической генерации REPORT.md
- ❌ Нет AUDIT записи после выполнения TASK

**4. Naming convention частично нарушен**:
- ❌ Файлы вне стандарта: `CODEX_SETUP.md`, `CONTINUE_SETUP.md` в корне (должны быть в `docs/`)
- ❌ Ventures ID format: `V-2026-001-typescript-1` (OK), но slug `typescript-1` не соответствует паттерну

**5. Unicode/hidden characters**:
- ⚠️ Риск наличия bidi/hidden unicode в промптах (требуется проверка и очистка)

---

## 🔧 NEXT CHANGES

### ПЛАН: Автоматический инженерный цикл

```
TASK файл (factory/tasks/TASK-XXXX.md)
    ↓
GitHub Actions workflow_dispatch
    ↓
scripts/engineer/run-task.mjs
    ↓
Читает TASK → Вызывает Claude API (PROMPT_ENGINEER + TASK content)
    ↓
Парсит response → Применяет изменения (apply-patch.mjs)
    ↓
Запускает проверки (npm run typecheck, npm run build)
    ↓
  SUCCESS?
    ↓ YES                               ↓ NO
    Commit changes              Rollback changes
    Generate REPORT.md          Generate REPORT with errors
    Create AUDIT entry          Exit with failure
    Push to branch
    Create PR
    ↓
CI checks (lint, typecheck, build)
    ↓
  All checks pass?
    ↓ YES
    Auto-merge to main (if enabled)
    ↓
AUDIT entry updated with "merged"
```

### ФАЙЛЫ ДЛЯ СОЗДАНИЯ

```
factory/
├── spec/
│   ├── PROMPT_ORCHESTRATOR.md        [NEW] - промпт для оркестратора
│   ├── PROMPT_ENGINEER.md            [NEW] - Claude API as engineer
│   └── PROMPT_DESIGNER.md            [MOVE] from factory/PROMPT_DESIGNER.md
│
├── templates/                        [NEW FOLDER]
│   ├── TASK.md                       [MOVE] from factory/TASK_TEMPLATE.md
│   ├── REPORT.md                     [MOVE] from factory/REPORT_TEMPLATE.md
│   ├── AUDIT.md                      [MOVE] from factory/AUDIT_ENTRY_TEMPLATE.md
│   └── VENTURE_CARD.md               [MOVE] from factory/VENTURE_CARD_TEMPLATE.md
│
scripts/
├── engineer/                         [NEW FOLDER]
│   ├── run-task.mjs                  [NEW] - основной TASK runner
│   ├── apply-patch.mjs               [NEW] - применение code changes
│   ├── verify-dod.mjs                [NEW] - проверка Definition of Done
│   └── generate-report.mjs           [NEW] - создание REPORT.md
│
├── utils/                            [NEW FOLDER]
│   └── clean-unicode.mjs             [NEW] - удаление bidi/hidden chars
│
.github/
└── workflows/
    ├── engineer.yml                  [NEW] - TASK execution workflow
    └── auto-merge.yml                [NEW] - auto-merge after checks pass

docs/                                 [NEW FOLDER]
├── CODEX_SETUP.md                    [MOVE] from root
├── CONTINUE_SETUP.md                 [MOVE] from root
└── MANUAL_CODEX_TRIGGER.md           [MOVE] from root
```

### ФАЙЛЫ ДЛЯ ОБНОВЛЕНИЯ

```
factory/PROMPT_CODEX.md               → [DELETE] merge content into PROMPT_ENGINEER.md
factory/NAMING_CONVENTION.md          → [UPDATE] добавить venture ID format rules
.github/workflows/codex.yml           → [UPDATE] добавить REPORT/AUDIT generation
src/lib/orchestrator.ts               → [UPDATE] интеграция engineer workflow
README.md                             → [UPDATE] обновить ссылки на новую структуру
```

### ФАЙЛЫ ДЛЯ УДАЛЕНИЯ

```
factory/PROMPT_CODEX.md               → контент переносится в PROMPT_ENGINEER.md
factory/TASK_TEMPLATE.md              → → factory/templates/TASK.md
factory/REPORT_TEMPLATE.md            → → factory/templates/REPORT.md
factory/AUDIT_ENTRY_TEMPLATE.md       → → factory/templates/AUDIT.md
factory/VENTURE_CARD_TEMPLATE.md      → → factory/templates/VENTURE_CARD.md
```

---

## 📝 TASKS (Стартовые задачи для внедрения)

### TASK-0008: ENGINEER RUNNER (Claude API)

**Title**: Implement automated ENGINEER runner with Claude API
**Priority**: P0 (Critical)
**Estimated**: 4 hours
**Assignee**: ENGINEER (Claude API)

**Context**:
Factory OS требует автоматизированный инженерный цикл: TASK → execute → REPORT. Сейчас есть только `codex.yml` для генерации ventures, но нет общего TASK runner.

**Description**:
Создать полностью автоматический инженерный цикл:
1. TASK файл из `factory/tasks/` → Claude API → code changes → checks → REPORT
2. GitHub Actions workflow для запуска TASK через workflow_dispatch
3. Генерация REPORT.md и AUDIT entry после выполнения

**Acceptance Criteria**:
1. ✅ `scripts/engineer/run-task.mjs` читает TASK file из `factory/tasks/TASK-XXXX.md`
2. ✅ Вызывает Claude API с `PROMPT_ENGINEER` + TASK content
3. ✅ Парсит response и применяет code changes (create/edit/delete files)
4. ✅ Запускает `npm run typecheck` и `npm run build`
5. ✅ Если checks pass: commit changes, generate REPORT.md, create AUDIT entry
6. ✅ Если checks fail: rollback changes, generate REPORT with errors
7. ✅ Все output логируется в `factory/results/TASK-XXXX-REPORT.md`
8. ✅ GitHub Actions workflow `.github/workflows/engineer.yml` работает через workflow_dispatch

**Files to create**:
- `factory/spec/PROMPT_ENGINEER.md` - промпт для Claude как engineer
- `scripts/engineer/run-task.mjs` - основной runner
- `scripts/engineer/apply-patch.mjs` - применение изменений
- `scripts/engineer/generate-report.mjs` - генерация REPORT
- `.github/workflows/engineer.yml` - GitHub Actions workflow

**DoD** (Definition of Done):
- [ ] TASK file обрабатывается корректно
- [ ] Claude API integration работает
- [ ] Code changes применяются правильно (create/edit/delete)
- [ ] TypeScript strict mode checks проходят
- [ ] Build checks проходят
- [ ] REPORT.md генерируется со всеми деталями (changes, checks, errors)
- [ ] AUDIT entry создаётся в `factory/audit/`
- [ ] CI passes (lint, typecheck, build)
- [ ] Документация обновлена (README)

**Example TASK flow**:
```bash
# Manually trigger workflow
gh workflow run engineer.yml -f taskId=TASK-0008

# Workflow:
1. Checkout repo
2. Install dependencies
3. Run scripts/engineer/run-task.mjs --taskId=TASK-0008
4. Apply changes
5. Run checks (typecheck, build)
6. Generate REPORT
7. Create AUDIT entry
8. Commit & push
9. Create PR (if needed)
```

---

### TASK-0009: Normalize Factory Structure & Clean Unicode

**Title**: Reorganize factory/ structure and remove hidden unicode
**Priority**: P1 (High)
**Estimated**: 2 hours
**Assignee**: ENGINEER (Claude API)

**Context**:
Текущая структура `factory/` частично хаотична: промпты размазаны между `factory/` и `factory/spec/`, шаблоны лежат в корне, документация в корне проекта. Также есть риск hidden/bidi unicode в промптах.

**Description**:
1. Реорганизовать `factory/` под Factory OS стандарт
2. Перенести все промпты в `factory/spec/`
3. Создать `factory/templates/` и перенести шаблоны
4. Создать `docs/` и перенести документацию
5. Удалить hidden/bidi unicode из всех .md файлов
6. Обновить NAMING_CONVENTION.md

**Acceptance Criteria**:
1. ✅ Все промпты в `factory/spec/` (ORCHESTRATOR, ENGINEER, DESIGNER, SCOUT, VALIDATOR, LAUNCHER, MONITOR)
2. ✅ Все шаблоны в `factory/templates/` (TASK, REPORT, AUDIT, VENTURE_CARD)
3. ✅ Вся документация в `docs/` (CODEX_SETUP, CONTINUE_SETUP, MANUAL_CODEX_TRIGGER)
4. ✅ `scripts/utils/clean-unicode.mjs` создан и запущен на всех .md
5. ✅ Нет hidden unicode в .md файлах (проверка: `grep -P "[\u200B-\u200D\u202A-\u202E]"`)
6. ✅ `NAMING_CONVENTION.md` обновлён (venture ID format, file naming)
7. ✅ Все imports/references обновлены (orchestrator.ts, workflows, scripts)

**Files to move**:
```
factory/PROMPT_CODEX.md               → DELETE (merge → PROMPT_ENGINEER.md)
factory/PROMPT_DESIGNER.md            → factory/spec/PROMPT_DESIGNER.md
factory/TASK_TEMPLATE.md              → factory/templates/TASK.md
factory/REPORT_TEMPLATE.md            → factory/templates/REPORT.md
factory/AUDIT_ENTRY_TEMPLATE.md       → factory/templates/AUDIT.md
factory/VENTURE_CARD_TEMPLATE.md      → factory/templates/VENTURE_CARD.md
CODEX_SETUP.md                        → docs/CODEX_SETUP.md
CONTINUE_SETUP.md                     → docs/CONTINUE_SETUP.md
MANUAL_CODEX_TRIGGER.md               → docs/MANUAL_CODEX_TRIGGER.md
```

**Files to create**:
- `scripts/utils/clean-unicode.mjs` - скрипт для удаления hidden chars
- `factory/spec/PROMPT_ORCHESTRATOR.md` - промпт для orchestrator
- `docs/` folder

**DoD**:
- [ ] Структура `factory/` соответствует стандарту
- [ ] Все промпты в `factory/spec/`
- [ ] Все шаблоны в `factory/templates/`
- [ ] Документация в `docs/`
- [ ] Нет hidden unicode (проверено скриптом)
- [ ] NAMING_CONVENTION.md обновлён
- [ ] Все references обновлены
- [ ] CI passes

**Verification**:
```bash
# Check unicode
grep -rn -P "[\u200B-\u200D\u202A-\u202E]" factory/

# Check structure
ls factory/spec/       # ORCHESTRATOR, ENGINEER, DESIGNER, SCOUT, VALIDATOR, LAUNCHER, MONITOR
ls factory/templates/  # TASK, REPORT, AUDIT, VENTURE_CARD
ls docs/               # CODEX_SETUP, CONTINUE_SETUP, MANUAL_CODEX_TRIGGER
```

---

### TASK-0010: Factory Control Panel (Optional)

**Title**: Add Factory OS Control Panel UI
**Priority**: P2 (Nice-to-have)
**Estimated**: 6 hours
**Assignee**: ENGINEER (Claude API)

**Context**:
Нужен web UI для мониторинга ventures, signals, tasks и триггера workflows. Сейчас всё управление через CLI/GitHub UI.

**Description**:
Создать dashboard в `/factory` route:
- Список ventures с метриками (MRR, users, visits)
- Список pending signals
- Последние AUDIT entries
- Кнопка "Trigger TASK" (вызов GitHub Actions workflow через API)
- Real-time status updates (polling или SSE)

**Acceptance Criteria**:
1. ✅ Dashboard `/factory` показывает все ventures из `state.json`
2. ✅ Показывает pending signals
3. ✅ Показывает recent AUDIT entries (last 10)
4. ✅ Кнопка "Run TASK" → workflow_dispatch через GitHub API
5. ✅ Real-time updates (polling каждые 5 сек или SSE)
6. ✅ Mobile-responsive design (Tailwind CSS)
7. ✅ TypeScript strict mode

**Files to create**:
- `src/app/factory/page.tsx` - главная страница dashboard
- `src/app/factory/layout.tsx` - layout для factory route
- `src/components/factory/Dashboard.tsx` - основной компонент
- `src/components/factory/VentureCard.tsx` - карточка venture
- `src/components/factory/SignalCard.tsx` - карточка signal
- `src/components/factory/AuditEntry.tsx` - AUDIT entry
- `src/app/api/factory/trigger-task/route.ts` - API для триггера workflow

**DoD**:
- [ ] Dashboard loads и отображает data из state.json
- [ ] Можно trigger TASK workflow через UI
- [ ] Responsive design работает (mobile, tablet, desktop)
- [ ] TypeScript strict mode passes
- [ ] Build succeeds
- [ ] CI passes

**Optional features**:
- Charts для metrics (MRR, users over time)
- WebSocket real-time updates вместо polling
- Фильтры/сортировка ventures
- Search по signals/tasks

---

## ⚙️ MANUAL GITHUB SETTINGS

### 1. GitHub Secrets (Required)

Добавить в: https://github.com/ar3m44/startup-factory/settings/secrets/actions

```
ANTHROPIC_API_KEY
├─ Value: sk-ant-api03-... (ваш Claude API key)
└─ Used by: .github/workflows/engineer.yml, .github/workflows/codex.yml
```

**Как получить**:
1. Открыть https://console.anthropic.com/settings/keys
2. Create Key → скопировать `sk-ant-api03-...`
3. GitHub repo → Settings → Secrets and variables → Actions → New repository secret
4. Name: `ANTHROPIC_API_KEY`, Value: `sk-ant-api03-...`

---

### 2. GitHub Actions Permissions (Required)

Включить в: https://github.com/ar3m44/startup-factory/settings/actions

```
Workflow permissions:
├─ ✅ Read and write permissions
└─ ✅ Allow GitHub Actions to create and approve pull requests
```

**Почему нужно**:
- Workflows должны создавать commits, branches, PRs
- Workflows должны обновлять state.json, создавать REPORT/AUDIT

---

### 3. Branch Protection для main (Required)

Настроить в: https://github.com/ar3m44/startup-factory/settings/branches

```
Branch: main
├─ ✅ Require a pull request before merging
│   ├─ Required approvals: 0 (auto-merge after CI)
│   └─ Dismiss stale reviews: ✅
│
├─ ✅ Require status checks to pass before merging
│   ├─ Require branches to be up to date: ✅
│   └─ Status checks:
│       ├─ ✅ ci / lint
│       ├─ ✅ ci / typecheck
│       └─ ✅ ci / build
│
├─ ✅ Require conversation resolution before merging
└─ ❌ Do not require signed commits (optional)
```

**Почему нужно**:
- Защита main от прямых pushes
- Весь код проходит через PR + CI checks
- Auto-merge возможен только после прохождения checks

---

### 4. Auto-merge Settings (Optional)

Включить в: https://github.com/ar3m44/startup-factory/settings

```
Pull Requests:
└─ ✅ Allow auto-merge
```

**Как использовать**:
```bash
# В PR добавить label "automerge" или команду
gh pr merge --auto --squash
```

**Почему нужно**:
- ENGINEER workflow может создать PR и включить auto-merge
- После прохождения CI → автоматический merge без ручного вмешательства

---

### 5. Vercel Integration (Already configured ✅)

**Current state**: Vercel подключён, auto-deploy из main
**No action needed**

---

## ⚠️ RISKS

### 1. Claude API Rate Limits
**Risk**: При высокой нагрузке (много TASK одновременно) можно упереться в rate limits Anthropic API.

**Mitigation**:
- Добавить retry logic с exponential backoff
- Queue для TASK (не более 3 одновременно)
- Мониторинг API usage в dashboard

**Impact**: Medium
**Probability**: Low

---

### 2. Breaking Changes при реорганизации
**Risk**: При переносе файлов (`factory/PROMPT_*.md` → `factory/spec/`) могут сломаться imports в `orchestrator.ts`, workflows.

**Mitigation**:
- TASK-0009 должен обновить все references
- CI должен поймать broken imports (typecheck fail)
- Создать TASK с checklists всех мест, где используются пути

**Impact**: High
**Probability**: Medium

---

### 3. Auto-merge может merge broken code
**Risk**: Если CI checks не покрывают всё (например, runtime errors), auto-merge может влить broken код.

**Mitigation**:
- Добавить больше checks: `npm run test` (если есть тесты)
- Smoke tests после merge (Vercel deployment check)
- Rollback mechanism (revert commit)

**Impact**: High
**Probability**: Low

---

### 4. Hidden Unicode в промптах может сломать Claude
**Risk**: Bidi/hidden unicode characters могут повлиять на качество ответа Claude или вызвать security issues.

**Mitigation**:
- TASK-0009 запускает `clean-unicode.mjs` на всех .md
- Pre-commit hook для проверки unicode
- CI check на наличие hidden chars

**Impact**: Medium
**Probability**: Medium

---

### 5. GitHub Actions costs
**Risk**: Большое количество workflow runs может привести к превышению бесплатного лимита (2000 minutes/month).

**Mitigation**:
- Мониторинг usage в GitHub Settings
- Оптимизация workflows (кеширование dependencies)
- Ограничение на количество одновременных TASK

**Impact**: Low (для небольшого проекта)
**Probability**: Low

---

## 📊 SUMMARY

**Приоритет задач**:
1. **TASK-0008** (P0) - ENGINEER RUNNER - критично для автоматизации
2. **TASK-0009** (P1) - Normalize structure - важно для порядка
3. **TASK-0010** (P2) - Control Panel - nice-to-have

**Следующие шаги**:
1. Добавить `ANTHROPIC_API_KEY` в GitHub Secrets
2. Настроить Branch Protection для main
3. Включить auto-merge
4. Запустить TASK-0008 (создать через ENGINEER или вручную)

**Ожидаемый результат**:
Полностью автоматизированный Factory OS с циклом:
```
Scout → Validator → Launcher → TASK → ENGINEER (Claude) → REPORT → AUDIT → Deploy
```
