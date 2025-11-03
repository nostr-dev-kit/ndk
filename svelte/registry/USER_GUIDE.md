# NDK Svelte Component Update Tracking - User Guide

## How to Know When Components Need Updates

When you install NDK Svelte components in your app, you want to know when updates are available. Here's how the system works:

## Quick Start

### 1. Install Components (Two Options)

**Option A: Use the standard shadcn-svelte CLI**
```bash
npx shadcn-svelte@latest add event-card
```

Then manually track it:
```bash
bun run scripts/post-add-hook.ts event-card
```

**Option B: Use the NDK wrapper (recommended)**
```bash
# In your project
npx jsr:@ndk/svelte add event-card
```

This automatically tracks the component version.

### 2. Check for Updates

At any time, run:

```bash
npx jsr:@ndk/svelte check-updates
```

Or if you cloned the registry scripts:
```bash
bun run scripts/check-updates.ts
```

You'll see output like:

```
🔍 NDK Svelte Component Update Checker

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Fetching latest versions from https://ndk.fyi/versions.json...
📦 Found 5 installed component(s)

✓ Registry version: 4.0.0-beta.21

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔔 2 component(s) have updates available:

  📦 event-card
     Event Card
     0.8.0 → 0.12.0 (+4 updates)
     Updated 3 days ago

  📦 user-profile
     User Profile
     0.15.0 → 0.18.0 (+3 updates)
     Updated 5 days ago

📝 To update a component, run:
   npx shadcn-svelte@latest add event-card
```

### 3. List Installed Components

```bash
npx jsr:@ndk/svelte list
```

Output:
```
📦 Installed Components (5):

  event-card                     v0.8.0      (10/15/2025)
  user-profile                   v0.15.0     (10/20/2025)
  zap-button                     v0.5.0      (10/10/2025)
  article-card                   v0.10.0     (10/18/2025)
  reactions                      v0.3.0      (10/12/2025)
```

## How It Works

### Component Lock File

When you install components, a `components.lock.json` file is created in your project:

```json
{
  "$schema": "https://ndk.fyi/schema/components-lock.json",
  "registry": {
    "name": "ndk-svelte",
    "url": "https://ndk.fyi",
    "version": "4.0.0-beta.21"
  },
  "components": {
    "event-card": {
      "name": "event-card",
      "version": "0.8.0",
      "installedAt": "2025-10-15T10:00:00Z",
      "source": "https://ndk.fyi",
      "files": [
        "src/lib/components/event-card/..."
      ]
    }
  },
  "lastChecked": "2025-10-29T14:30:00Z"
}
```

**Commit this file to Git** so your team knows which versions are installed.

### Version Manifest

The registry exposes a `versions.json` API:

```bash
curl https://ndk.fyi/versions.json
```

Returns:
```json
{
  "registry": {
    "name": "ndk-svelte",
    "version": "4.0.0-beta.21",
    "generated": "2025-10-29T14:30:00Z"
  },
  "components": {
    "event-card": {
      "version": "0.12.0",
      "lastModified": "2025-10-29T10:30:00Z",
      "type": "registry:block",
      "title": "Event Card",
      "dependencies": ["@nostr-dev-kit/ndk"],
      "registryDependencies": []
    }
  }
}
```

The checker compares your lockfile against this manifest to find updates.

## Workflow Examples

### Daily Development

```bash
# Install a new component
npx jsr:@ndk/svelte add event-card

# Check for updates once a week
npx jsr:@ndk/svelte check-updates

# Update a component if needed
npx shadcn-svelte@latest add event-card
```

### CI/CD Integration

Add to your GitHub Actions:

```yaml
name: Check Component Updates

on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9am
  workflow_dispatch:

jobs:
  check-updates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1

      - name: Check for component updates
        run: |
          bun install
          bun run scripts/check-updates.ts

      - name: Create issue if updates available
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '📦 NDK Component Updates Available',
              body: 'Component updates are available. Run `npx jsr:@ndk/svelte check-updates` to see details.',
              labels: ['dependencies']
            })
```

### Pre-commit Hook

Check for updates before committing:

```bash
# .husky/pre-commit
#!/bin/sh
npx jsr:@ndk/svelte check-updates --quiet
```

## Manual Tracking

If you prefer not to use the CLI wrapper, manually track components:

### After Installing

```bash
# Install with shadcn-svelte
npx shadcn-svelte@latest add event-card

# Manually track it
curl -s https://ndk.fyi/versions.json | \
  jq '.components["event-card"]' > .ndk-component-versions.json
```

### Checking Manually

```bash
# Fetch latest versions
curl -s https://ndk.fyi/versions.json -o /tmp/ndk-versions.json

# Check specific component
jq '.components["event-card"]' /tmp/ndk-versions.json
```

## Programmatic Usage

### In Your SvelteKit App

Create a dev-time dashboard:

```svelte
<!-- src/routes/dev/components/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';

  let components = $state([]);
  let updates = $state([]);

  onMount(async () => {
    // Load local lockfile
    const lockfile = await fetch('/components.lock.json').then(r => r.json());

    // Fetch latest versions
    const versions = await fetch('https://ndk.fyi/versions.json').then(r => r.json());

    // Compare
    for (const [name, info] of Object.entries(lockfile.components)) {
      const latest = versions.components[name];
      if (latest && latest.version !== info.version) {
        updates.push({
          name,
          current: info.version,
          latest: latest.version,
        });
      }
    }
  });
</script>

<div class="dashboard">
  <h1>Component Dashboard</h1>

  {#if updates.length > 0}
    <div class="updates">
      <h2>🔔 {updates.length} Update(s) Available</h2>
      {#each updates as update}
        <div class="update-card">
          <strong>{update.name}</strong>
          <span>{update.current} → {update.latest}</span>
        </div>
      {/each}
    </div>
  {:else}
    <p>✅ All components up to date!</p>
  {/if}
</div>
```

### In Node Scripts

```typescript
import { readFileSync } from 'fs';

interface Lockfile {
  components: Record<string, { version: string }>;
}

async function checkUpdates() {
  const lockfile: Lockfile = JSON.parse(
    readFileSync('components.lock.json', 'utf-8')
  );

  const versions = await fetch('https://ndk.fyi/versions.json')
    .then(r => r.json());

  for (const [name, info] of Object.entries(lockfile.components)) {
    const latest = versions.components[name];
    if (latest?.version !== info.version) {
      console.log(`${name}: ${info.version} → ${latest.version}`);
    }
  }
}

checkUpdates();
```

## Best Practices

### 1. Commit components.lock.json

```bash
git add components.lock.json
git commit -m "chore: update component lockfile"
```

This ensures your team knows which versions are in use.

### 2. Check Weekly

Set a reminder to check for updates:

```bash
# In your package.json
{
  "scripts": {
    "check-deps": "npm outdated && npx jsr:@ndk/svelte check-updates"
  }
}
```

### 3. Read Changelogs

Before updating, check what changed:

```bash
# Visit component page
open https://ndk.fyi/components/event-card

# Or check Git history
open https://github.com/nostr-dev-kit/ndk/commits/master/svelte/src/lib/components/event-card
```

### 4. Test After Updates

```bash
# Update component
npx shadcn-svelte@latest add event-card

# Run tests
npm test

# Check types
npm run check
```

### 5. Update Dependencies

Components might require newer NDK versions:

```json
// Check dependencies in versions.json
{
  "event-card": {
    "dependencies": ["@nostr-dev-kit/ndk@^3.0.0"]
  }
}
```

## Troubleshooting

### No components.lock.json file

**Problem**: You installed components before the tracking system existed.

**Solution**: Manually create the lockfile:

```bash
# Initialize empty lockfile
echo '{
  "$schema": "https://ndk.fyi/schema/components-lock.json",
  "registry": {
    "name": "ndk-svelte",
    "url": "https://ndk.fyi",
    "version": "4.0.0-beta.21"
  },
  "components": {},
  "lastChecked": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}' > components.lock.json

# For each installed component
bun run scripts/post-add-hook.ts event-card
bun run scripts/post-add-hook.ts user-profile
# etc...
```

### Version mismatch errors

**Problem**: Component expects different NDK version.

**Solution**: Check dependencies and update:

```bash
# Check required versions
curl -s https://ndk.fyi/versions.json | jq '.components["event-card"]'

# Update NDK
npm install @nostr-dev-kit/ndk@latest @nostr-dev-kit/svelte@latest
```

### Can't fetch versions.json

**Problem**: Network error or registry offline.

**Solution**: Use local fallback or retry:

```bash
# Download for offline use
curl -s https://ndk.fyi/versions.json > .ndk-versions-cache.json

# Use cached version
jq '.components["event-card"]' .ndk-versions-cache.json
```

## FAQ

**Q: Do I need to track component versions?**

A: No, it's optional. The standard `shadcn-svelte` workflow works fine. Tracking helps you know when updates are available.

**Q: Will this slow down installs?**

A: No, tracking happens after installation and takes <1s.

**Q: Can I use this with other registries?**

A: Yes! The scripts can be adapted to any shadcn-style registry that exposes a `versions.json` manifest.

**Q: What if I don't want updates?**

A: That's fine! The tracking is informational only. You control when to update.

**Q: How does this compare to jsrepo?**

A: Similar functionality but integrated with shadcn-svelte. You don't need to learn a new CLI or manage multiple registries.

## Next Steps

- See `VERSIONING.md` for technical details
- See `COMPONENT_VERSIONING_SUMMARY.md` for implementation overview
- Visit https://ndk.fyi for component docs

---

**Need help?** Open an issue at https://github.com/nostr-dev-kit/ndk/issues
