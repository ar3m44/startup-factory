# Audit Directory

This directory contains audit logs of all autonomous system decisions and actions.

## File Format

Each audit entry is saved as a markdown file with the following naming convention:
```
AUDIT-YYYY-MM-DD-HH-MM.md
```

Example: `AUDIT-2025-01-17-14-30.md`

## Audit Entry Types

### 1. signal_found
- Scout Agent found a new market signal
- Data: number of signals, confidence scores
- Actor: Scout

### 2. validation_completed
- Validator Agent completed validation of a signal
- Data: signal ID, validation ID, decision (GO/NO-GO), pipeline statuses
- Actor: Validator

### 3. venture_launched
- Launcher Agent launched a new venture to production
- Data: venture ID, name, track, URL
- Actor: Launcher

### 4. venture_killed
- Monitor Agent decided to kill a venture
- Data: venture ID, kill reason, final metrics
- Actor: Monitor

### 5. decision_made
- Orchestrator or Agent made a significant decision
- Data: decision type, reasoning, outcome
- Actor: Orchestrator, Scout, Validator, Launcher, Monitor, or User

## Audit Entry Structure

Each audit entry contains:

```markdown
# AUDIT-YYYY-MM-DD-HH-MM

**Date**: ISO 8601 timestamp
**Type**: signal_found | validation_completed | venture_launched | venture_killed | decision_made
**Actor**: Scout | Validator | Orchestrator | Launcher | Monitor | User

## Data

```json
{
  "key": "value",
  ...
}
```

## Metadata

```json
{
  "duration": 1234,  // ms
  "cost": 50,        // ₽
  ...
}
```
```

## Purpose

Audit logs provide:

1. **Transparency** - Full visibility into autonomous system actions
2. **Accountability** - Clear record of who/what made each decision
3. **Debugging** - Trace issues back to root cause
4. **Analytics** - Analyze system performance over time
5. **Compliance** - Maintain record for review

## Workflow

Every significant action or decision by any agent automatically creates an audit entry here.

```
Agent Action → Create Audit Entry → Save to audit/ → Permanent record
```

All audit entries are immutable and permanent.
