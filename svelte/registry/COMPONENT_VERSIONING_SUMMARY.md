# Component Versioning Implementation Summary

## What Was Added

You now have **component-level versioning** similar to jsrepo, but integrated into your existing shadcn-svelte registry system.

### ✅ Created Files

1. **`scripts/add-component-versions.ts`**
   - Scans Git history for each component
   - Calculates version numbers (0.x.0 based on commit count)
   - Detects breaking changes from commit messages
   - Updates registry.json with version info

2. **`scripts/generate-version-manifest.ts`**
   - Creates lightweight versions.json manifest
   - Exposes component versions via API endpoint
   - Allows programmatic version checking

3. **`VERSIONING.md`**
   - Complete documentation of the versioning system
   - Usage instructions
   - CI/CD integration guide
   - Best practices

4. **`examples/check-component-updates.ts`**
   - Example code for checking component updates
   - Shows how users can consume version info

### 📦 Updated Files

- **`package.json`**: Added scripts:
  - `registry:versions` - Add versions to registry.json
  - `registry:manifest` - Generate versions.json
  - `registry:update` - Run both

## How to Use

### Before Each Release

```bash
cd registry
bun run registry:update
```

This will:
1. Calculate versions for all components
2. Update `registry.json` with version + updatedAt fields
3. Generate `versions.json` manifest

### What Gets Added to Registry

Before:
```json
{
  "name": "event-card",
  "type": "registry:block",
  "files": [...]
}
```

After:
```json
{
  "name": "event-card",
  "version": "0.12.0",
  "updatedAt": "2025-10-29T10:30:00Z",
  "type": "registry:block",
  "files": [...]
}
```

## How Versioning Works

### Version Calculation

- **Format**: `0.{commits}.0`
- **Example**:
  - 5 commits to event-card → v0.5.0
  - 12 commits to event-card → v0.12.0

### Update Detection

- Tracks last Git commit date for each file
- Most recent date becomes component's `updatedAt`

### Breaking Changes

Detected from commit messages:
```bash
# This will mark as breaking
git commit -m "feat(event-card)!: remove deprecated prop"

# Or this
git commit -m "BREAKING CHANGE: event-card API changed"
```

## User Benefits

### 1. Check for Updates

Users can fetch `https://ndk.fyi/versions.json`:

```typescript
const versions = await fetch('https://ndk.fyi/versions.json').then(r => r.json());
console.log(versions.components['event-card']);
// { version: "0.12.0", lastModified: "2025-10-29...", ... }
```

### 2. See Component History

On your website, you can show:
- Current version
- Last updated date
- Number of updates since installation
- Breaking changes

### 3. Update Notifications

Build a tool that checks:
```bash
npx @nostr-dev-kit/svelte check-updates
# event-card: 0.8.0 → 0.12.0 (updated 2 days ago)
# user-profile: 0.15.0 → 0.18.0 (updated 1 week ago)
```

## Next Steps

### 1. Run It Now (Test)

```bash
cd /Users/pablofernandez/tenex/NDK-nhlteu/svelte/registry
bun run registry:update
```

This will:
- Add versions to all 30+ components in registry.json
- Create versions.json manifest

### 2. Commit the Changes

```bash
git add registry.json static/versions.json scripts/ VERSIONING.md
git commit -m "feat: add component-level versioning system"
```

### 3. Add to CI/CD

Update your GitHub Actions workflow:

```yaml
- name: Update Component Versions
  run: |
    cd registry
    bun run registry:update

- name: Build
  run: |
    cd registry
    bun run build
```

### 4. Document on Website

Add a "Versions" section to your component pages:

```svelte
<script>
  import { onMount } from 'svelte';

  let version = $state('');
  let lastModified = $state('');

  onMount(async () => {
    const data = await fetch('/versions.json').then(r => r.json());
    const component = data.components['event-card'];
    version = component.version;
    lastModified = new Date(component.lastModified).toLocaleDateString();
  });
</script>

<div class="component-version">
  Version: {version}
  <span>Last updated: {lastModified}</span>
</div>
```

### 5. Create Update Checker (Future)

Build a CLI tool:
```bash
npx @nostr-dev-kit/svelte check-updates
npx @nostr-dev-kit/svelte update event-card
```

## Advantages Over jsrepo

| Feature | Your System | jsrepo |
|---------|-------------|--------|
| **Installation** | Existing shadcn-svelte CLI | Requires jsrepo CLI |
| **Hosting** | Self-hosted (ndk.fyi) | jsrepo.com platform |
| **Control** | Full control over UX | Limited to their UI |
| **Versioning** | ✅ Automated via Git | Manual semver |
| **Updates** | ✅ REST API check | CLI only |
| **Cost** | Free (your hosting) | Free + marketplace fees |
| **Branding** | ✅ Your brand | jsrepo brand |

## Customization Options

### Use Manual Versions

Instead of Git-based, manually set versions in registry.json:

```json
{
  "name": "event-card",
  "version": "2.0.0",  // Manually set
  "changelog": [
    {
      "version": "2.0.0",
      "date": "2025-11-01",
      "changes": ["Stable release", "BREAKING: New API"]
    }
  ]
}
```

### Change Version Format

Edit `scripts/add-component-versions.ts`:

```typescript
function calculateVersion(componentName: string, files: RegistryFile[]): string {
  const major = 1; // Stable
  const minor = commitCount;
  return `${major}.${minor}.0`;
}
```

### Add Deprecation Warnings

Extend the manifest:

```json
{
  "components": {
    "old-component": {
      "version": "0.5.0",
      "deprecated": true,
      "replacedBy": "new-component",
      "deprecationMessage": "This component will be removed in v5.0"
    }
  }
}
```

## Questions?

- See `VERSIONING.md` for complete documentation
- See `examples/check-component-updates.ts` for usage examples
- The scripts are in `scripts/` directory
- Run `bun run registry:update` to test it now!

## Summary

**You now have:**
- ✅ Automatic component versioning
- ✅ Version manifest API (versions.json)
- ✅ Git-based update tracking
- ✅ Breaking change detection
- ✅ Full control (no external dependencies)

**Without:**
- ❌ jsrepo platform lock-in
- ❌ Maintenance overhead of two systems
- ❌ Confusing users with multiple CLIs

This gives you the benefits of jsrepo's versioning **within your existing shadcn-svelte setup**. Best of both worlds! 🎉
