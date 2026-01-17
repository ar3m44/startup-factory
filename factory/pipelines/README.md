# Pipelines Directory

This directory contains validation results from the Validator Agent.

## File Format

Each validation result is saved as a markdown file with the following naming convention:
```
VALIDATION-YYYY-MM-DD-HH-MM.md
```

Example: `VALIDATION-2025-01-17-14-30.md`

## Validation Structure

Each validation file contains:

1. **Basic Info** - Signal ID, date, decision (GO/NO-GO)
2. **Pipeline Results** - Status table for all 5 pipelines
3. **Detailed Analysis** - Deep dive into each pipeline
4. **Decision** - GO or NO-GO with reasoning
5. **Venture Blueprint** - Only if GO decision

## The 5 Validation Pipelines

### 1. TAM Analysis ✅
- Market size >$1M/year in Russia
- Target audience >50k people
- Payment willingness validated

**Status**: GREEN | YELLOW | RED

### 2. Competitor Analysis ✅
- No strong free alternatives with >100k users
- Clear differentiation identified
- Competitive advantage defined

**Status**: GREEN | YELLOW | RED

### 3. Technical Feasibility ✅
- Can build in ≤7 days (FAST) or ≤3 months (LONG)
- Tech stack identified
- No critical blockers

**Status**: GREEN | YELLOW | RED

### 4. Pricing Feasibility ✅
- LTV/CAC ratio >3
- Clear monetization model
- Sustainable unit economics

**Status**: GREEN | YELLOW | RED

### 5. Risk Assessment ✅
- 0 critical risks
- ≤2 medium risks
- All risks have mitigation

**Status**: GREEN | YELLOW | RED

## GO/NO-GO Decision Criteria

### GO if:
- All 5 pipelines = GREEN, OR
- 4 pipelines = GREEN + 1 pipeline = YELLOW

### NO-GO if:
- Any pipeline = RED, OR
- <4 pipelines = GREEN

## Venture Blueprint

If decision is **GO**, the validation includes a Venture Blueprint with:

- Name, slug, tagline, description
- Target audience details
- MVP specification (features, user flow, tech stack)
- Pricing & monetization model
- GTM strategy
- Success metrics
- Risks and mitigation

This blueprint is used to create a new venture and generate tasks for Codex Agent.

## Workflow

```
Signal → Validator runs 5 pipelines → GO/NO-GO decision → If GO: Create Venture Blueprint
```

All validation results are saved here for audit trail.
