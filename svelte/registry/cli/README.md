# ndk-svelte CLI

Command-line tool for managing NDK Svelte components.

## Installation

The CLI is designed to be used with `npx` without installation:

```bash
npx ndk-svelte add event-card
```

Or install globally:

```bash
npm install -g ndk-svelte
```

## Commands

### `add`

Add NDK components to your project.

```bash
# Add specific components
npx ndk-svelte add event-card user-profile

# Add a single component
npx ndk-svelte add event-card

# List available components
npx ndk-svelte add

# Install all components (requires --yes)
npx ndk-svelte add --all --yes

# Overwrite existing files
npx ndk-svelte add event-card --overwrite
```

**Options:**
- `[components...]` - Component names to add
- `-a, --all` - Install all available components
- `-o, --overwrite` - Overwrite existing files
- `-y, --yes` - Skip confirmation prompts
- `-p, --path <path>` - Custom installation path
- `--registry <url>` - Custom registry URL (default: https://shadcn.ndk.fyi)

### `upgrade`

Check for component updates and optionally upgrade them.

```bash
# Check for updates
npx ndk-svelte upgrade

# Auto-upgrade all components
npx ndk-svelte upgrade --yes

# Use custom registry
npx ndk-svelte upgrade --registry https://custom-registry.com
```

**Options:**
- `-y, --yes` - Auto-upgrade all components without prompting
- `--registry <url>` - Custom registry URL (default: https://shadcn.ndk.fyi)

## How It Works

1. **Scans your project** for files with `@ndk-version` headers
2. **Fetches latest versions** from the registry
3. **Compares versions** and shows available upgrades
4. **Upgrades components** using `npx shadcn-svelte@latest add <component>`

## Example Output

```
🚀 NDK Svelte Component Upgrade Tool

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Scanning project for NDK components...

📁 Scanning src/ (42 files)

✓ Found 3 NDK component(s):

  📦 event-card v0.8.0 (8 file(s))
  📦 user-profile v0.15.0 (13 file(s))
  📦 zap-button v0.5.0 (1 file(s))

📡 Checking for updates from https://shadcn.ndk.fyi...

✓ Registry version: 4.0.0-beta.22

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔔 2 component(s) can be upgraded:

  📦 event-card
     Event Card
     0.8.0 → 0.14.0

  📦 user-profile
     User Profile
     0.15.0 → 0.18.0

💡 To upgrade all components, run:
   npx ndk-svelte upgrade --yes

   Or upgrade individually:
   npx shadcn-svelte@latest add event-card
   npx shadcn-svelte@latest add user-profile
```

## Version Headers

Components installed with `npx shadcn-svelte@latest add` include version headers:

**Svelte files:**
```svelte
<!-- @ndk-version: event-card@0.14.0 -->
<script>
  // Component code
</script>
```

**TypeScript/JavaScript files:**
```typescript
// @ndk-version: event-card@0.14.0
export function something() { }
```

The CLI scans these headers to determine which components you have installed and their versions.

## Publishing

To publish a new version:

```bash
npm version patch  # or minor, or major
npm publish
```
