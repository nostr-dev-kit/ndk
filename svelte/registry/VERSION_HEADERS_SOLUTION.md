# ✅ THE REAL SOLUTION: Version Headers

## 💡 Your Brilliant Idea

> "Can't we put a simple version header on the shipped components?"

**YES!** This is the cleanest, simplest solution. No lockfiles, no filesystem scanning guesswork - just read the version header from the actual component files.

---

## 🎯 How It Works

### 1. Add Version Headers to Registry Components

Every component file gets a header comment:

```svelte
<!-- @ndk-version: event-card@0.12.0 -->
<script lang="ts">
  // Component code...
</script>
```

For TypeScript files:
```typescript
// @ndk-version: event-card@0.12.0
export function something() {
  // ...
}
```

### 2. User Installs Component (Normal)

```bash
npx shadcn-svelte@latest add event-card
```

The component files with version headers are copied to their project.

### 3. User Checks for Upgrades

```bash
npx ndk-shadcn upgrade
```

Or download and run:
```bash
curl -s https://ndk.fyi/scripts/scan-and-upgrade.ts | bun run -
```

### 4. Script Scans for Headers

The script:
1. **Scans** all `.svelte`, `.ts`, `.js` files in `src/` and `lib/`
2. **Extracts** version headers: `@ndk-version: component-name@version`
3. **Fetches** latest versions from `https://ndk.fyi/versions.json`
4. **Compares** installed vs latest versions
5. **Shows** available upgrades

### 5. Output Example

```
🚀 NDK Svelte Component Upgrade Tool

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Scanning project for NDK components...

📁 Scanning src/ (127 files)

✓ Found 3 NDK component(s):

  📦 event-card v0.8.0 (8 file(s))
  📦 user-profile v0.15.0 (13 file(s))
  📦 zap-button v0.5.0 (1 file(s))

📡 Checking for updates from https://ndk.fyi...

✓ Registry version: 4.0.0-beta.21

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔔 2 component(s) can be upgraded:

  📦 event-card
     Event Card
     0.8.0 → 0.12.0

  📦 user-profile
     User Profile
     0.15.0 → 0.18.0

💡 To upgrade all components, run:
   npx ndk-shadcn upgrade --yes

   Or upgrade individually:
   npx shadcn-svelte@latest add event-card
   npx shadcn-svelte@latest add user-profile
```

### 6. Auto-Upgrade (Optional)

```bash
npx ndk-shadcn upgrade --yes
```

Automatically runs `shadcn-svelte add` for each outdated component.

---

## 🏗️ Implementation

### Step 1: Add Version Headers to Your Registry

```bash
cd /Users/pablofernandez/tenex/NDK-nhlteu/svelte/registry

# This adds version headers to ALL component files
bun run registry:update
```

This script:
1. Reads `registry.json`
2. For each component, adds version header to every file
3. Svelte files get: `<!-- @ndk-version: name@version -->`
4. TS/JS files get: `// @ndk-version: name@version`

**Before:**
```svelte
<script lang="ts">
  export let event: NDKEvent;
</script>
```

**After:**
```svelte
<!-- @ndk-version: event-card@0.12.0 -->
<script lang="ts">
  export let event: NDKEvent;
</script>
```

### Step 2: Deploy

```bash
git add registry.json static/versions.json src/
git commit -m "feat: add version headers to all components"
git push
```

Now all new installs will have version headers!

### Step 3: Users Run Scanner

```bash
# Download scanner
curl -o ndk-upgrade.ts https://ndk.fyi/scripts/scan-and-upgrade.ts

# Check for upgrades
bun ndk-upgrade.ts

# Or auto-upgrade
bun ndk-upgrade.ts --yes
```

---

## ✨ Why This is Better

### vs. Lockfile Approach
✅ **No manual tracking** - version is in the file itself
✅ **No lockfile to maintain** - scans actual installed code
✅ **Survives copy/paste** - if someone copies a component, version comes with it
✅ **Simple** - just read file headers

### vs. Filesystem Scanning
✅ **Accurate** - knows exact version, not guessing from file dates
✅ **Component-level** - tracks each component independently
✅ **Multiple files** - knows all files belonging to a component

### vs. jsrepo
✅ **No external platform** - self-hosted
✅ **No new CLI** - uses standard shadcn-svelte for install
✅ **Optional upgrade tool** - users can use it or not
✅ **Full control** - your registry, your rules

---

## 📦 Files

### ✅ USE THESE (Version Header Solution)

| File | Purpose |
|------|---------|
| `scripts/add-version-headers.ts` | Adds headers to registry components |
| `scripts/scan-and-upgrade.ts` | **Users run this to check/upgrade** ⭐ |
| `scripts/add-component-versions.ts` | Calculates versions |
| `scripts/generate-version-manifest.ts` | Creates versions.json API |
| `static/versions.json` | Public API for version info |

### ❌ OPTIONAL (Keep for Reference)

| File | Purpose |
|------|---------|
| `scripts/check-updates-from-files.ts` | Filesystem scanner (backup approach) |
| `scripts/post-add-hook.ts` | Won't work (no hooks) |
| `scripts/create-lockfile.ts` | Not needed (using headers) |
| `scripts/ndk-cli.ts` | Future npm package |

---

## 🎨 Example Component with Header

### event-card-root.svelte

```svelte
<!-- @ndk-version: event-card@0.12.0 -->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';

  let { event, children }: { event: NDKEvent; children?: any } = $props();

  setContext('event', event);
</script>

{@render children?.()}
```

### context.svelte.ts

```typescript
// @ndk-version: event-card@0.12.0
import { getContext } from 'svelte';
import type { NDKEvent } from '@nostr-dev-kit/ndk';

export function getEventContext(): NDKEvent {
  return getContext('event');
}
```

---

## 🚀 User Workflow

### First Time Setup (One Command)

```bash
# Download the upgrade tool
curl -o ndk-upgrade.ts https://ndk.fyi/scripts/scan-and-upgrade.ts
```

### Regular Workflow

```bash
# Check for upgrades (whenever you want)
bun ndk-upgrade.ts

# Upgrade specific component
npx shadcn-svelte@latest add event-card

# Or upgrade all at once
bun ndk-upgrade.ts --yes
```

---

## 📝 Documentation for Users

### On your docs site (ndk.fyi):

```markdown
## Checking for Component Upgrades

All NDK components include version headers so you can easily check for updates.

### Check for Upgrades

Download and run the upgrade scanner:

```bash
curl -o ndk-upgrade.ts https://ndk.fyi/scripts/scan-and-upgrade.ts
bun ndk-upgrade.ts
```

This scans your project for `@ndk-version` headers and compares them
against the latest versions in our registry.

### Auto-Upgrade All Components

```bash
bun ndk-upgrade.ts --yes
```

This will upgrade all outdated components automatically.

### Manual Upgrade

You can always upgrade components manually:

```bash
npx shadcn-svelte@latest add <component-name>
```

This reinstalls the component with the latest version (including updated version header).
```

---

## 🎯 Future: Publish as npm Package

Later, you can publish `@nostr-dev-kit/upgrade` for easier usage:

```bash
npm install -g @nostr-dev-kit/upgrade

ndk-upgrade check
ndk-upgrade --yes
```

But for now, the curl approach works perfectly!

---

## ✅ Action Items

### 1. Add Version Headers (Now)

```bash
cd /Users/pablofernandez/tenex/NDK-nhlteu/svelte/registry
bun run registry:update
```

Check a file to confirm:
```bash
head -1 src/lib/ndk/event-card/event-card-root.svelte
# Should show: <!-- @ndk-version: event-card@0.12.0 -->
```

### 2. Test the Scanner

```bash
# Create test project structure
mkdir -p test-project/src/lib/components/ui/event-card
echo '<!-- @ndk-version: event-card@0.8.0 -->' > test-project/src/lib/components/ui/event-card/test.svelte

# Run scanner
cd test-project
bun run ../scripts/scan-and-upgrade.ts
```

### 3. Deploy

```bash
cd /Users/pablofernandez/tenex/NDK-nhlteu/svelte/registry
git add .
git commit -m "feat: add version headers to all components and upgrade scanner"
git push
```

### 4. Document

Add "Upgrade Components" section to ndk.fyi docs.

---

## 📊 Comparison Summary

| Feature | Version Headers | Lockfile | Filesystem Scan |
|---------|----------------|----------|-----------------|
| Accuracy | ✅ Exact version | ✅ Exact version | ❌ Date heuristic |
| Setup | ✅ None | ❌ Manual tracking | ✅ None |
| Survives copy/paste | ✅ Yes | ❌ No | ❌ No |
| Multiple files | ✅ Tracks all | ✅ If tracked | ⚠️ Finds all dirs |
| Complexity | ✅ Simple | ❌ Complex | ⚠️ Medium |

**Winner: Version Headers** 🏆

---

## 🎉 Summary

**Your idea was perfect!**

✅ Add version headers to shipped components
✅ Users scan their files for headers
✅ Compare against registry API
✅ Show available upgrades
✅ Optional auto-upgrade

**No lockfiles, no hooks, no guessing - just read the version from the actual component file!**

---

**Test it now:**
```bash
cd /Users/pablofernandez/tenex/NDK-nhlteu/svelte/registry
bun run registry:update
head -1 src/lib/ndk/event-card/event-card-root.svelte
```

🚀
