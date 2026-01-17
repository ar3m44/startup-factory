# Signals Directory

This directory contains market signals found by the Scout Agent.

## File Format

Each signal is saved as a markdown file with the following naming convention:
```
SIGNAL-YYYY-MM-DD-HH-MM.md
```

Example: `SIGNAL-2025-01-17-14-30.md`

## Signal Structure

Each signal file contains:

1. **Основная информация** - Date, source, URL, confidence score
2. **Описание сигнала** - Problem, target audience, quotes, context
3. **Возможное решение** - MVP description, price, timeline, key features
4. **Анализ рынка** - TAM, competitors, advantage
5. **Оценка критериев** - Mandatory and optional criteria checklist
6. **Confidence Score** - Calculated score (0-100)
7. **Риски** - Identified risks and mitigation strategies

## Confidence Score Thresholds

- **70-100**: Excellent signal, pass to Validator
- **50-69**: Good signal, requires additional analysis
- **0-49**: Weak signal, reject

## Status

Signals can have the following statuses:
- `pending_validation` - Found by Scout, waiting for validation
- `validated` - Validated by Validator (GO decision)
- `rejected` - Rejected by Validator (NO-GO decision)

## Workflow

```
Scout finds signal → Saves to signals/ → Validator analyzes → GO/NO-GO decision
```

If **GO**, the signal moves to venture creation.
If **NO-GO**, the signal is archived.
