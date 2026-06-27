# Staff Task Tracker

A task management app for staff — create, assign, and track tasks across your team.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod, drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Development

```bash
# Install dependencies
pnpm install

# Run the API server
pnpm --filter @workspace/api-server run dev

# Full typecheck
pnpm run typecheck

# Build all packages
pnpm run build

# Push DB schema changes (dev only)
pnpm --filter @workspace/db run push

# Regenerate API hooks and Zod schemas
pnpm --filter @workspace/api-spec run codegen
```

## Automatic GitHub sync

Code is automatically backed up to GitHub using two mechanisms:

### 1. Replit → GitHub push (every 5 minutes)

A background script (`scripts/sync-to-github.sh`) runs continuously in Replit.
Every 5 minutes it commits any pending changes and pushes them to GitHub.

**One-time setup:**
1. Create a GitHub [fine-grained PAT](https://github.com/settings/tokens?type=beta) with **Contents: read + write** scope scoped to your repository.
2. Add two Replit secrets (Secrets tab → Add secret):
   - `GITHUB_SYNC_TOKEN` — the PAT from step 1
   - `GITHUB_REPO` — your full repo slug, e.g. `myorg/staff-task-tracker`
3. The **GitHub Sync** workflow in Replit starts automatically and begins pushing.

### 2. GitHub Actions CI (on every push to main)

`.github/workflows/ci.yml` runs on every push to `main` and:
- Installs dependencies and runs a full TypeScript typecheck
- Commits any auto-generated file changes back to `main` using the built-in `GITHUB_TOKEN` (no setup required)

This means every push is verified, and generated files are always in sync.
