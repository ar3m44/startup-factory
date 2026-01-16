# Tasks Directory

Эта директория содержит задачи для Codex.

## Структура

Каждая задача — это файл формата `TASK-XXXX.md`, где:
- `XXXX` — порядковый номер задачи (0001, 0002, ..., 9999)

## Пример

```
factory/tasks/
  TASK-0001.md  — Инициализация Next.js проекта
  TASK-0002.md  — Добавление CI workflow
  TASK-0003.md  — Создание структуры factory/
  ...
```

## Создание новой задачи

Используй шаблон из `factory/templates/TASK_TEMPLATE.md`.

## Workflow

1. Orchestrator создаёт файл `TASK-XXXX.md`
2. Codex читает задачу
3. Codex выполняет задачу
4. Codex создаёт отчёт в `factory/results/REPORT-XXXX.md`
