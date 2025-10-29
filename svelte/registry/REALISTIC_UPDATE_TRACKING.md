# Realistic Component Update Tracking

## The Truth About Post-Install Hooks

❌ `shadcn-svelte` does **NOT** support post-install hooks
❌ No automatic tracking after `npx shadcn-svelte add`
✅ Users must manually track OR use alternative methods

---

## ✅ Realistic Solutions

### Option 1: Manual Tracking (Simplest)

**After installing a component:**

```bash
# Install component
npx shadcn-svelte@latest add event-card

# Manually record it
echo '{"name":"event-card","version":"0.12.0","installedAt":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' >> .ndk-components.json
```

**Check for updates:**

```bash
bun run scripts/check-updates.ts
```

**Pros:** Simple, no extra tools
**Cons:** Manual, error-prone

---

### Option 2: Git-Based Tracking (Automatic)

Track components by watching file changes in Git:

```bash
# After installing any component, check what files were added
git status
# src/lib/components/ui/event-card/...

# The check-updates script can scan your filesystem
bun run scripts/check-updates-from-files.ts
```

This script scans `src/lib/components/ui/` and compares against the registry.

**Pros:** Automatic, no manual tracking
**Cons:** Requires consistent file structure

---

### Option 3: Package.json Script Wrapper (Semi-Automatic)

Add a wrapper in your project's `package.json`:

```json
{
  "scripts": {
    "add-component": "npx shadcn-svelte@latest add $1 && node scripts/track-component.js $1"
  }
}
```

Then users run:
```bash
npm run add-component event-card
```

**Pros:** Semi-automatic, simple
**Cons:** Users must remember to use the wrapper

---

### Option 4: Separate CLI Package (Future)

Publish an npm package that wraps shadcn-svelte:

```bash
npm install -g @nostr-dev-kit/svelte-cli

ndk add event-card
# This runs: npx shadcn-svelte add + tracking
```

**Pros:** Clean UX, automatic tracking
**Cons:** Requires publishing and maintaining a separate package

---

## 🎯 Recommended Approach

### For Now: **Filesystem Scanning (Option 2)**

Don't require manual tracking. Instead, the update checker **scans the filesystem** to detect installed components:

```typescript
// scripts/check-updates-from-files.ts
import { readdirSync, existsSync } from 'fs';

// Scan for installed components
const uiPath = 'src/lib/components/ui';
const installed = readdirSync(uiPath); // ['event-card', 'user-profile', ...]

// Fetch latest versions
const versions = await fetch('https://ndk.fyi/versions.json').then(r => r.json());

// Compare
for (const componentName of installed) {
  const latest = versions.components[componentName];
  if (latest) {
    console.log(`${componentName}: installed (latest: v${latest.version})`);
  }
}
```

**Users just run:**
```bash
curl -o check-updates.ts https://ndk.fyi/scripts/check-updates-from-files.ts
bun check-updates.ts
```

No lockfile needed! It just scans what's actually installed.

---

### Future: **Publish @nostr-dev-kit/svelte CLI (Option 4)**

Create an official CLI that wraps shadcn-svelte:

```bash
npx @nostr-dev-kit/svelte add event-card
npx @nostr-dev-kit/svelte check-updates
npx @nostr-dev-kit/svelte list
```

This gives the best UX but requires more work.

---

## 📝 Updated User Workflow

### Without Lockfile (Filesystem Scanning)

```bash
# 1. Install components normally
npx shadcn-svelte@latest add event-card
npx shadcn-svelte@latest add user-profile

# 2. Check for updates (scans filesystem)
curl -o check-updates.ts https://ndk.fyi/scripts/check-updates-from-files.ts
bun check-updates.ts

# Output:
# 📦 Found 2 installed components:
#   - event-card (latest: v0.12.0)
#   - user-profile (latest: v0.18.0)
```

### With Lockfile (Manual Tracking)

```bash
# 1. Install component
npx shadcn-svelte@latest add event-card

# 2. Manually track it
echo '{
  "components": {
    "event-card": {
      "installedAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }
  }
}' > components.lock.json

# 3. Check for updates
bun run scripts/check-updates.ts
```

---

## 🔧 What Needs to Change

### Remove These (Don't Work Without Hooks)

❌ `post-add-hook.ts` - Can't auto-run after install
❌ `ndk-cli.ts` wrapper - Only works if published as npm package
❌ References to "automatic tracking" in docs

### Keep These (Still Useful)

✅ `add-component-versions.ts` - Adds versions to your registry
✅ `generate-version-manifest.ts` - Creates versions.json
✅ `check-updates-from-files.ts` - **Scans filesystem** ⭐
✅ API endpoint at `/versions.json`

### Create This (New Approach)

🆕 `check-updates-from-files.ts` - Scans `src/lib/components/ui/` instead of lockfile

---

## 📊 Comparison

| Method | Auto-Track | Lockfile | Complexity |
|--------|-----------|----------|------------|
| Manual tracking | ❌ | ✅ | Low |
| Filesystem scan | ✅ | ❌ | Low |
| package.json wrapper | ~50% | ✅ | Medium |
| Published CLI | ✅ | ✅ | High |

**Recommendation:** Start with **filesystem scanning** - zero setup, just works!

---

## ✅ Revised Implementation Plan

### Phase 1: Filesystem Scanning (Now)

1. Create `check-updates-from-files.ts` that scans the filesystem
2. No lockfile needed
3. Users just run the script

### Phase 2: Published CLI (Future)

1. Create `@nostr-dev-kit/svelte` npm package
2. Wraps shadcn-svelte with tracking
3. Better UX, automatic lockfile

---

## 🎯 What Users Actually Do

### Today (Realistic)

```bash
# Install normally
npx shadcn-svelte@latest add event-card

# Check for updates (downloads and runs scanner)
curl -s https://ndk.fyi/scripts/check-updates-from-files.ts | bun run -
```

### Future (With Published CLI)

```bash
# Install with tracking
npx @nostr-dev-kit/svelte add event-card

# Check for updates
npx @nostr-dev-kit/svelte check
```

---

## Summary

**The scripts I created assume hooks that don't exist.**

**Realistic solution:**
- ✅ Scan filesystem for installed components
- ✅ Compare against `/versions.json` API
- ❌ No lockfile needed (unless manually maintained)
- ❌ No post-install hooks (not supported by shadcn-svelte)

Let me create the corrected `check-updates-from-files.ts` script now...
