# Component Versioning System - Complete ✅

## What Was Built

A complete component versioning system that allows users to check for updates and upgrade their installed NDK components.

### 1. Version Calculation System
**Location:** `scripts/add-component-versions.ts`

- Calculates semantic versions from Git commit history
- Format: `v0.{commit_count}.0`
- Updates `registry.json` with version metadata

### 2. Version Manifest Generator
**Location:** `scripts/generate-version-manifest.ts`

- Creates public API endpoint: `static/versions.json`
- Exposes component versions for upgrade checking
- Includes registry metadata and component info

### 3. Version Header Injection
**Location:** `scripts/add-version-headers.ts`

- Adds version comments to all component files
- Svelte: `<!-- @ndk-version: component@version -->`
- TS/JS: `// @ndk-version: component@version`
- Runs automatically as part of `registry:update`

### 4. NPX CLI Tool
**Location:** `cli/`

A standalone npm package that provides a unified interface for managing NDK components:

```bash
# Add components
npx ndk-svelte add event-card user-profile

# Check for updates
npx ndk-svelte upgrade
```

**Features:**
- `add` command - Install components (wraps shadcn-svelte)
- `upgrade` command - Check for updates and upgrade
- Lists available components
- Scans user projects for version headers
- Fetches latest versions from registry
- Shows available upgrades
- Auto-upgrade with `--yes` flag
- Custom registry support

**Files:**
- `cli/package.json` - Package configuration
- `cli/src/index.ts` - CLI entry point
- `cli/src/commands/add.ts` - Add command logic
- `cli/src/commands/upgrade.ts` - Upgrade command logic
- `cli/README.md` - User documentation
- `cli/PUBLISHING.md` - Publishing guide

### 5. Unified Update Command
**Location:** `package.json`

```bash
bun run registry:update
```

Runs all three steps:
1. Calculate versions from Git
2. Generate versions.json manifest
3. Add version headers to files

## Current State

### Component Versions Generated ✅
- **event-card**: v0.14.0 (14 commits)
- **article-card**: v0.12.0 (12 commits)
- **user-profile**: v0.10.0 (10 commits)
- **highlight-card**: v0.6.0 (6 commits)
- **blocks**: v0.5.0 (5 commits)
- ...and 29 more components

### Files Updated ✅
- ✅ 74/76 component files have version headers
- ✅ `registry.json` includes version metadata
- ✅ `static/versions.json` ready to serve
- ✅ CLI built and ready to publish

### Documentation Created ✅
- `HOW_TO_USE.md` - Complete usage guide
- `cli/README.md` - CLI documentation
- `cli/PUBLISHING.md` - Publishing instructions
- This file - System overview

## How It Works

### For You (Maintainer)

**Before each release:**
```bash
bun run registry:update
git add .
git commit -m "chore: update component versions"
git push
```

This calculates versions, generates the manifest, and adds headers.

**Publishing the CLI (one-time):**
```bash
cd cli
npm publish
```

Users can then run `npx ndk-svelte upgrade`

### For Users

**Install components:**
```bash
# Add specific components
npx ndk-svelte add event-card user-profile

# List available components
npx ndk-svelte add
```

**Check for updates:**
```bash
npx ndk-svelte upgrade
```

**Output example:**
```
🚀 NDK Svelte Component Upgrade Tool

✓ Found 3 NDK component(s):
  📦 event-card v0.8.0 (8 file(s))
  📦 user-profile v0.15.0 (13 file(s))
  📦 zap-button v0.5.0 (1 file(s))

🔔 2 component(s) can be upgraded:

  📦 event-card
     Event Card
     0.8.0 → 0.14.0

  📦 user-profile
     User Profile
     0.15.0 → 0.18.0

💡 To upgrade:
   npx ndk-svelte add event-card user-profile
```

**Auto-upgrade all:**
```bash
npx ndk-svelte upgrade --yes
```

## Next Steps

### 1. Publish the CLI Package
```bash
cd cli
npm login
npm publish
```

Test it works:
```bash
npx ndk-svelte@latest upgrade
```

### 2. Deploy to Production

Push all changes to deploy:
```bash
git add .
git commit -m "feat: add component versioning system"
git push
```

This makes `https://ndk.fyi/versions.json` available.

### 3. Add Documentation to ndk.fyi

Create a page at `https://ndk.fyi/docs/upgrading` with:

```markdown
# Upgrading Components

Check for updates to your installed NDK components:

\`\`\`bash
npx ndk-svelte upgrade
\`\`\`

Auto-upgrade all components:

\`\`\`bash
npx ndk-svelte upgrade --yes
\`\`\`

## How It Works

All NDK components include version headers that allow the CLI to detect
which components you have installed and compare them with the registry.
```

### 4. Announce to Users

Once deployed, announce the new feature:
- Twitter/Nostr post
- Add to release notes
- Update installation docs

## Benefits

✅ **Simple UX** - Just `npx ndk-svelte upgrade`
✅ **No setup** - Works automatically with installed components
✅ **Accurate** - Version headers travel with the code
✅ **Flexible** - Works with any file organization
✅ **Future-proof** - Easy to extend with new features

## Architecture

```
┌─────────────────────┐
│   Git Commits       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ add-component-      │
│ versions.ts         │ ─────┐
└─────────────────────┘      │
                              │
┌─────────────────────┐      │
│ generate-version-   │      ├─► registry.json
│ manifest.ts         │ ─────┤   (with versions)
└─────────────────────┘      │
                              │
┌─────────────────────┐      │
│ add-version-        │      │
│ headers.ts          │ ─────┘
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Component Files     │
│ (with headers)      │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│ shadcn-svelte       │
│ copies to user      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ User's Project      │
│ (components with    │
│  version headers)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ npx ndk-svelte      │
│ upgrade             │
│                     │
│ 1. Scans files      │
│ 2. Reads headers    │
│ 3. Fetches manifest │
│ 4. Shows upgrades   │
└─────────────────────┘
```

## Testing

Tested and verified:
- ✅ Version calculation from Git history
- ✅ Version headers in 74/76 files (2 files don't exist yet)
- ✅ versions.json manifest generation
- ✅ CLI detects installed components
- ✅ CLI compares versions correctly
- ✅ Shows upgrade suggestions

Ready for production! 🚀
