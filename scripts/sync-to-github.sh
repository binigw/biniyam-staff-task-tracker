#!/usr/bin/env bash
# Automatic GitHub sync script.
# Runs in a loop and pushes any uncommitted local changes to GitHub every 5 minutes.
#
# Required environment variables (set as Replit secrets):
#   GITHUB_SYNC_TOKEN  — A GitHub Personal Access Token with "repo" scope
#   GITHUB_REPO        — Full repo slug, e.g. "myorg/myrepo"
#
# Setup (one-time):
#   1. Create a fine-grained GitHub PAT with Contents (read + write) scope
#   2. Add GITHUB_SYNC_TOKEN and GITHUB_REPO as Replit secrets
#   3. This script is run automatically by the "GitHub Sync" workflow

set -euo pipefail

if [ -z "${GITHUB_SYNC_TOKEN:-}" ] || [ -z "${GITHUB_REPO:-}" ]; then
  echo "[sync] ERROR: GITHUB_SYNC_TOKEN and GITHUB_REPO must be set."
  echo "[sync] Add them as Replit secrets and restart this workflow."
  exit 1
fi

REMOTE_URL="https://${GITHUB_SYNC_TOKEN}@github.com/${GITHUB_REPO}.git"
INTERVAL_SECONDS=300  # 5 minutes

git config user.email "replit-sync@users.noreply.github.com"
git config user.name "Replit Auto-Sync"

# Ensure the github remote is registered
if git remote get-url github &>/dev/null; then
  git remote set-url github "$REMOTE_URL"
else
  git remote add github "$REMOTE_URL"
fi

echo "[sync] Starting GitHub auto-sync (interval: ${INTERVAL_SECONDS}s, repo: ${GITHUB_REPO})"

while true; do
  # Stage everything that is not ignored
  git add -A

  if git diff --cached --quiet; then
    echo "[sync] $(date -u +%Y-%m-%dT%H:%M:%SZ) — no changes, skipping push"
  else
    COMMIT_MSG="chore: auto-sync $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    git commit -m "$COMMIT_MSG"
    echo "[sync] Committed: $COMMIT_MSG"

    # Pull before push to handle diverged histories (prefer remote)
    git pull --rebase github main || {
      echo "[sync] WARN: rebase failed, resetting staged changes and retrying next cycle"
      git rebase --abort 2>/dev/null || true
    }

    if git push github HEAD:main; then
      echo "[sync] Pushed to github/${GITHUB_REPO}:main"
    else
      echo "[sync] WARN: push failed, will retry next cycle"
    fi
  fi

  sleep "$INTERVAL_SECONDS"
done
