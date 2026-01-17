# Как запустить Codex вручную

У вас есть 2 способа запустить Codex для генерации кода:

## Вариант 1: Через GitHub UI (самый простой)

1. Откройте: https://github.com/ar3m44/startup-factory/actions
2. Слева выберите workflow: **"Codex Agent - Autonomous Code Generation"**
3. Справа нажмите: **"Run workflow"** (кнопка с иконкой ▶️)
4. В форме введите:
   - **ventureId**: `V-2026-001-typescript-1`
   - **slug**: `typescript-1`
   - **taskFile**: `factory/tasks/V-2026-001-typescript-1.md`
   - **branchName**: `venture/typescript-1`
5. Нажмите зеленую кнопку: **"Run workflow"**

⏳ Codex начнет генерировать код. Процесс займет 2-5 минут.

---

## Вариант 2: Через API (если есть Personal Access Token)

```bash
# Создайте Personal Access Token:
# https://github.com/settings/tokens/new
# Права: repo, workflow

export GITHUB_TOKEN="your_token_here"

curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/ar3m44/startup-factory/dispatches \
  -d '{
    "event_type": "venture_approved",
    "client_payload": {
      "ventureId": "V-2026-001-typescript-1",
      "ventureName": "TypeScript Docs Generator",
      "slug": "typescript-1",
      "taskFile": "factory/tasks/V-2026-001-typescript-1.md",
      "branchName": "venture/typescript-1"
    }
  }'
```

---

## Что произойдет

1. **GitHub Actions запустится** (проверьте: https://github.com/ar3m44/startup-factory/actions)
2. **Codex вызовет Claude API** с вашим ANTHROPIC_API_KEY
3. **Claude сгенерирует полный Next.js проект**:
   - Landing page
   - Core features (TypeScript parser, playground, export)
   - Payment integration (YooKassa)
   - Analytics setup
   - Database schema
   - Tests
4. **Создастся новая ветка**: `venture/typescript-1`
5. **Создастся Pull Request** автоматически
6. **CI проверит код** (TypeScript, ESLint, Build)
7. **Вы сможете review PR** и merge

---

## Проверка прогресса

### Шаг 1: Actions
https://github.com/ar3m44/startup-factory/actions

Вы увидите:
```
🤖 Codex Agent - Autonomous Code Generation
Running...
```

### Шаг 2: Logs
Кликните на workflow → Jobs → "generate-venture-code"

Вы увидите:
```
🤖 Codex Agent: Generating code for TypeScript Docs Generator
📝 Task file: factory/tasks/V-2026-001-typescript-1.md
🔧 Calling Claude API...
✅ Code generated successfully!
📦 Creating 24 files...
✅ All files created
📌 Committing to branch: venture/typescript-1
🚀 Creating Pull Request...
✅ PR created: https://github.com/ar3m44/startup-factory/pull/X
```

### Шаг 3: Pull Request
https://github.com/ar3m44/startup-factory/pulls

Вы увидите новый PR:
```
🤖 [Codex] Generate code for TypeScript Docs Generator

Generated complete Next.js application:
- Landing page with hero, features, pricing
- TypeScript parser with interactive playground
- HTML/PDF export functionality
- YooKassa payment integration
- Analytics tracking
- 24 files created

✅ Build: Passing
✅ TypeScript: No errors
✅ ESLint: No warnings
```

---

## Стоимость

Claude Sonnet 4 pricing:
- Input: ~10,000 tokens (system prompt + task) = $0.03
- Output: ~20,000 tokens (generated code) = $0.30
- **Total: ~$0.33 за venture**

---

## Troubleshooting

### Error: "ANTHROPIC_API_KEY is not set"
- Проверьте GitHub Secrets: https://github.com/ar3m44/startup-factory/settings/secrets/actions
- Должен быть `ANTHROPIC_API_KEY` с вашим ключом от Anthropic

### Error: "Failed to parse generated code"
- Codex вернул неправильный формат
- Проверьте логи в GitHub Actions
- Возможно, нужно обновить system prompt

### Error: "PR creation failed"
- Проверьте, что ветка `venture/typescript-1` не существует
- Удалите старую ветку если есть: `git push origin --delete venture/typescript-1`

---

## Результат

После успешного запуска вы получите:

1. ✅ Полный Next.js проект в `ventures/typescript-1/`
2. ✅ Pull Request с review request
3. ✅ CI checks (build, tests, lint)
4. ✅ Vercel preview deployment (если настроен)

Можете review код, внести правки, и merge в main для деплоя! 🚀

---

**Готов попробовать?**

Откройте: https://github.com/ar3m44/startup-factory/actions/workflows/codex.yml

И нажмите "Run workflow" справа! ▶️
