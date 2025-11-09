# Component Migration Script

This script migrates the component directory structure from nested (3-4 levels) to flat (2 levels) to enable individual component installation via jsrepo.

## Usage

### Run Complete Migration
```bash
tsx scripts/migrate-components.ts
```

### Dry Run (Preview Changes)
```bash
tsx scripts/migrate-components.ts --dry-run
```

### Run Specific Stages
```bash
# Stage 1: Icons only
tsx scripts/migrate-components.ts --stage=icons

# Stage 2: Simple components only
tsx scripts/migrate-components.ts --stage=simple

# Stage 3: Multi-file components only
tsx scripts/migrate-components.ts --stage=multi

# Stage 4: Update imports only
tsx scripts/migrate-components.ts --stage=imports

# Stage 5: Update metadata files only
tsx scripts/migrate-components.ts --stage=metadata

# Stage 6: Cleanup empty directories only
tsx scripts/migrate-components.ts --stage=cleanup

# Run all stages
tsx scripts/migrate-components.ts --stage=all
```

## What It Does

### Stage 1: Icons (16 moves)
Moves each icon file into its own directory:
- `icons/bookmark.svelte` → `icons/bookmark/bookmark.svelte`
- `icons/calendar.svelte` → `icons/calendar/calendar.svelte`
- ... (14 more)

### Stage 2: Simple Components (~53 moves)
Flattens single-file component variants:
- `components/article/cards/compact` → `components/article-card-compact`
- `components/user/cards/glass` → `components/user-card-glass`
- ... (51 more)

### Stage 3: Multi-File Components (~16 moves)
Flattens components with multiple primitives:
- `components/event/cards/compound/*` → `components/event-card/*`
- `components/note-composer/composers/compound/*` → `components/note-composer/*`
- ... (14 more)

### Stage 4: Update Imports
Scans all `.svelte`, `.ts`, and `.js` files and updates import paths:
- Handles absolute imports (`$lib/registry/...`)
- Handles relative imports (`../../...`)
- Updates ~1000+ import statements

### Stage 5: Update Metadata
Updates `metadata.json` files:
- `importPath` field
- `command` field (jsrepo install command)
- Other path references

### Stage 6: Cleanup
Removes empty directories left after moves.

## Safety Features

1. **Git History Preservation**: Uses `git mv` to preserve file history
2. **Staged Commits**: Each stage creates its own commit for easy rollback
3. **Dry Run Mode**: Preview all changes before executing
4. **Incremental Execution**: Run stages individually for safer migration

## After Migration

1. Verify build: `npm run build`
2. Check types: `bun x svelte-check`
3. Test components work in showcase routes
4. Update jsrepo version: `"version": "0.0.16"` in jsrepo-build-config.json
5. Verify jsrepo detects blocks: `jsrepo publish --dry-run`
6. Publish: `jsrepo publish`

## Rollback

If something goes wrong, rollback the commits:
```bash
# Find the commit before migration started
git log --oneline

# Reset to that commit
git reset --hard <commit-hash>
```

## Mapping File

See `scripts/migration-map.json` for the complete list of all moves.
