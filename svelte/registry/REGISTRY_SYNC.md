# Registry Sync Workflow

This document explains how to keep `registry.json` in sync with actual block files.

## The Problem

The registry.json can easily get out of sync with the actual component files because:
1. Developers add new blocks but forget to add them to registry.json
2. Blocks are renamed or deleted but registry.json isn't updated
3. Dependencies change but registryDependencies aren't updated

When registry.json is out of sync, users can't install the latest blocks via `npx shadcn-svelte@latest add <block-name>`.

## The Solution

We have automated scripts to:
1. **Generate** registry entries from actual block files
2. **Validate** that registry is in sync
3. **Update** versions and metadata

## Scripts

### `bun run registry:validate`
Checks if registry.json is in sync with actual files.

**What it checks:**
- All blocks in filesystem are in registry
- All blocks in registry exist in filesystem
- Registry dependencies match actual imports

**Exit codes:**
- `0` - Registry is valid
- `1` - Registry is out of sync

**Example output:**
```
🔍 Validating registry...

📁 Filesystem blocks: 28
📋 Registry blocks: 28

✅ Registry is valid and in sync!
```

### `bun run registry:generate`
Auto-generates registry.json entries for all blocks.

**What it does:**
- Scans `src/lib/ndk/blocks/*.svelte`
- Generates registry entries for each block
- Detects dependencies by analyzing imports
- Preserves version/updatedAt for existing entries
- Merges with existing registry (keeps non-block items)

**Options:**
- `--dry-run` - Show what would be generated without writing

**Example output:**
```
🔍 Scanning blocks directory...

Found 28 block components

📊 Registry Update Summary:
   ✨ Added: 3 blocks
   🔄 Updated: 25 blocks
   📦 Total blocks: 28
   📋 Total items: 56

✨ New blocks added:
   • new-block-1
   • new-block-2
   • new-block-3
```

### `bun run registry:update`
Full registry update (generate + versions + manifest + headers).

**What it does:**
1. `registry:generate` - Generate entries from blocks
2. `registry:versions` - Add version info from Git history
3. `registry:manifest` - Generate version manifest
4. `registry:headers` - Add version headers to files

This is the **complete workflow** you should run before deploying.

## Workflow

### When Adding a New Block

1. Create your block in `src/lib/ndk/blocks/my-new-block.svelte`
2. Export it from `src/lib/ndk/blocks/index.ts`
3. Run validation to see it's missing:
   ```bash
   bun run registry:validate
   ```
4. Generate registry entry:
   ```bash
   bun run registry:generate
   ```
5. Review changes:
   ```bash
   git diff registry.json
   ```
6. If good, run full update:
   ```bash
   bun run registry:update
   ```
7. Commit the changes

### When Renaming/Deleting a Block

1. Rename/delete the block file
2. Update export in `src/lib/ndk/blocks/index.ts`
3. Run generation (it will remove old entries automatically):
   ```bash
   bun run registry:generate
   ```
4. Run full update:
   ```bash
   bun run registry:update
   ```
5. Commit

### Before Deploying

Always run the full update to ensure everything is in sync:

```bash
bun run registry:update
```

### In CI/CD

Add validation to your CI pipeline:

```yaml
- name: Validate Registry
  run: bun run registry:validate
```

This ensures PRs can't be merged if registry is out of sync.

## Manual Registry Entries

Some registry entries are **not blocks** (like `article-card`, `event-card`, etc.). These are primitive components or meta-exports. The generation script preserves these when merging.

**Blocks:** Live in `src/lib/ndk/blocks/*.svelte` and are installable preset layouts.
**Primitives:** Live in their own directories (like `src/lib/ndk/article-card/`) and provide composable pieces.
**Meta-exports:** Like the `blocks` entry which exports everything from the blocks index.

## How It Works

### Auto-Detection

The generation script detects:

1. **Component name:** From filename (`follow-button.svelte` → `follow-button`)
2. **Title:** Generated from name (`follow-button` → `Follow Button`)
3. **Dependencies:** By analyzing imports:
   ```svelte
   <script>
     import { ArticleCard } from '$lib/ndk/article-card';
     // → adds "article-card" to registryDependencies
   </script>
   ```
4. **Description:** Generated based on name patterns and dependencies

### Version Management

Versions are managed by Git history:
- Version format: `0.{commit_count}.0`
- `updatedAt`: Most recent commit date for component files
- Breaking changes detected from commit messages containing "BREAKING" or "!"

## Troubleshooting

### "Block exists in filesystem but not in registry"

Run: `bun run registry:generate`

### "Block exists in registry but not in filesystem"

The block was deleted. Run: `bun run registry:generate` to clean it up.

### "Dependency mismatch"

The component imports from a library but doesn't list it in `registryDependencies`, or vice versa.

**Fix:** The auto-generator will correct this. Run: `bun run registry:generate`

### Registry validation fails in CI

1. Pull latest changes: `git pull`
2. Run full update: `bun run registry:update`
3. Commit and push: `git add . && git commit -m "chore: sync registry" && git push`

## Best Practices

1. **Always validate before committing:**
   ```bash
   bun run registry:validate && git commit
   ```

2. **Use the full update command before deploys:**
   ```bash
   bun run registry:update
   ```

3. **Add registry validation to pre-commit hook** (optional but recommended)

4. **Review registry changes** in PRs to ensure they look correct

5. **Don't manually edit registry.json** for block entries - use the generator instead

## FAQ

**Q: Why do I need both generate and update?**

A: `generate` creates/updates registry entries. `update` does generation PLUS version tracking, manifests, and headers - everything needed for deployment.

**Q: Can I manually edit registry.json?**

A: Yes, but only for non-block entries (primitives, meta-exports, etc.). Block entries should be generated automatically.

**Q: What if I want custom descriptions?**

A: You can manually edit descriptions in registry.json. The generator preserves them on subsequent runs if you want different text than the auto-generated descriptions.

**Q: Will this overwrite my manual changes?**

A: The generator preserves: version, updatedAt, and manual entries (non-blocks). It only updates: files, dependencies, and auto-generated metadata for blocks.
