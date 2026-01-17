#!/bin/bash
# Trigger Codex GitHub Action manually via repository_dispatch

REPO="ar3m44/startup-factory"
EVENT_TYPE="venture_approved"

# Read venture info from state.json
VENTURE_ID="V-2026-001-typescript-1"
VENTURE_NAME="Веб-сервис: загружаешь TypeScript файлы → получаешь красивую интерактивную документацию за 1 минуту"
SLUG="typescript-1"
TASK_FILE="factory/tasks/V-2026-001-typescript-1.md"
BRANCH_NAME="venture/typescript-1"

# Trigger GitHub Action
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/${REPO}/dispatches \
  -f event_type="${EVENT_TYPE}" \
  -f "client_payload[ventureId]=${VENTURE_ID}" \
  -f "client_payload[ventureName]=${VENTURE_NAME}" \
  -f "client_payload[slug]=${SLUG}" \
  -f "client_payload[taskFile]=${TASK_FILE}" \
  -f "client_payload[branchName]=${BRANCH_NAME}"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Codex workflow triggered successfully!"
  echo ""
  echo "📌 Check workflow status:"
  echo "   https://github.com/${REPO}/actions"
  echo ""
  echo "📌 Expected branch: ${BRANCH_NAME}"
  echo "📌 Task file: ${TASK_FILE}"
  echo ""
  echo "⏳ Codex is now generating code..."
  echo "   This may take 2-5 minutes"
else
  echo ""
  echo "❌ Failed to trigger workflow"
  echo "   Make sure 'gh' CLI is installed and authenticated"
  echo "   Run: gh auth login"
fi
