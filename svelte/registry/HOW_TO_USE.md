# How to Use Component Versioning

## For You (Maintainer)

### One-Time Setup (Do This Once)

```bash
cd /Users/pablofernandez/tenex/NDK-nhlteu/svelte/registry

# Generate versions and add headers to all components
bun run registry:update
```

This does 3 things:
1. Calculates version numbers based on Git history
2. Updates `registry.json` with versions
3. **Adds version headers to all component files**

Example result:
```svelte
<!-- @ndk-version: event-card@0.12.0 -->
<script lang="ts">
  // Your component
</script>
```

### Deploy

```bash
git add .
git commit -m "feat: add component version headers"
git push
```

That's it! Now every component has a version header.

### When You Update Components

**Just run this before each release:**

```bash
bun run registry:update
git add .
git commit -m "chore: update component versions"
git push
```

This updates all version numbers based on new Git commits.

---

## For Users (How They Check for Updates)

### Option 1: NPX Command (Recommended)

```bash
# Check for upgrades (no installation required)
npx ndk-svelte upgrade
```

**Output:**
```
🚀 NDK Svelte Component Upgrade Tool

🔍 Scanning project for NDK components...

✓ Found 3 NDK component(s):
  📦 event-card v0.8.0 (8 file(s))
  📦 user-profile v0.15.0 (13 file(s))
  📦 zap-button v0.5.0 (1 file(s))

📡 Checking for updates from https://ndk.fyi...

🔔 2 component(s) can be upgraded:

  📦 event-card
     Event Card
     0.8.0 → 0.14.0

  📦 user-profile
     User Profile
     0.15.0 → 0.18.0

💡 To upgrade:
   npx shadcn-svelte@latest add event-card
   npx shadcn-svelte@latest add user-profile
```

### Option 2: Auto-Upgrade All

```bash
npx ndk-svelte upgrade --yes
```

This automatically runs `npx shadcn-svelte add` for each outdated component.

### Option 3: Download Script (Alternative)

If you prefer not to use npx:

```bash
# Download script
curl -o ndk-upgrade.ts https://ndk.fyi/scripts/scan-and-upgrade.ts

# Check for upgrades
bun ndk-upgrade.ts

# Or one-liner
curl -s https://ndk.fyi/scripts/scan-and-upgrade.ts | bun run -
```

---

## How It Works

### 1. Component Has Version Header

When users install a component:
```bash
npx shadcn-svelte@latest add event-card
```

The file gets copied with the header:
```svelte
<!-- @ndk-version: event-card@0.12.0 -->
<script lang="ts">
  // Component code
</script>
```

### 2. Scanner Reads Headers

When they run the upgrade checker:
```bash
bun ndk-upgrade.ts
```

It:
1. Scans their `src/` directory for `.svelte`, `.ts`, `.js` files
2. Reads the `@ndk-version` headers
3. Fetches latest versions from `https://ndk.fyi/versions.json`
4. Compares and shows outdated components

### 3. User Upgrades

```bash
# Upgrade specific component
npx shadcn-svelte@latest add event-card

# Or upgrade all at once
bun ndk-upgrade.ts --yes
```

---

## Documentation to Add to ndk.fyi

Add this page to your docs:

```markdown
# Checking for Component Updates

All NDK components include version headers so you can check for updates.

## Quick Check

Use the `ndk-svelte` CLI (no installation required):

\`\`\`bash
npx ndk-svelte upgrade
\`\`\`

This scans your project for `@ndk-version` headers and compares them
against the latest versions.

## Auto-Upgrade

\`\`\`bash
npx ndk-svelte upgrade --yes
\`\`\`

This automatically upgrades all outdated components.

## How Version Headers Work

Each NDK component file includes a version header:

**Svelte files:**
\`\`\`svelte
<!-- @ndk-version: event-card@0.12.0 -->
<script>
  // Component code
</script>
\`\`\`

**TypeScript files:**
\`\`\`typescript
// @ndk-version: event-card@0.12.0
export function something() { }
\`\`\`

The upgrade checker scans these headers to determine installed versions.

## Manual Upgrade

You can always upgrade manually:

\`\`\`bash
npx shadcn-svelte@latest add <component-name>
\`\`\`

This reinstalls the component with the latest version header.
```

---

## Testing

### Test That Headers Exist

```bash
# Check a few components
head -1 src/lib/ndk/event-card/event-card-root.svelte
# Should show: <!-- @ndk-version: event-card@0.12.0 -->

head -1 src/lib/ndk/user-profile/context.svelte.ts
# Should show: // @ndk-version: user-profile@0.18.0
```

### Test the Scanner

```bash
# Create test project
mkdir -p /tmp/test-project/src/components
echo '<!-- @ndk-version: event-card@0.8.0 -->
<script>
  export let event;
</script>' > /tmp/test-project/src/components/event-card.svelte

# Run scanner
cd /tmp/test-project
curl -s https://ndk.fyi/scripts/scan-and-upgrade.ts | bun run -
```

Should output:
```
✓ Found 1 NDK component(s):
  📦 event-card v0.8.0 (1 file(s))
```

---

## Common Questions

**Q: Do I need to run `registry:update` after every change?**

A: Only before releases. The versions are based on Git commits, so run it when you want to bump versions.

**Q: What if I manually edit a component file?**

A: The version header stays at the top. When you run `registry:update` again, it updates the version number.

**Q: Can users ignore the upgrade checker?**

A: Yes! It's optional. They can continue using `shadcn-svelte` normally.

**Q: What if someone copies a component file?**

A: The version header travels with the file, so the scanner will detect it.

**Q: Will this break existing installations?**

A: No! Existing components without headers still work fine. The scanner just won't detect them.

---

## Summary

**You run once:**
```bash
bun run registry:update
git push
```

**Users run anytime:**
```bash
npx ndk-svelte upgrade
```

That's it! ✨
