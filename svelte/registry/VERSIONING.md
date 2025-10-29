# Component Versioning System

This registry implements automatic component-level versioning similar to jsrepo, allowing developers to:
- Track component versions independently
- See when components were last updated
- Check for breaking changes
- Query version information programmatically

## How It Works

### Automatic Version Detection

Component versions are automatically calculated based on Git history:
- **Version format**: `0.{commits}.0` (e.g., `0.5.0` = 5 commits to that component)
- **Update tracking**: Last Git commit date for any file in the component
- **Breaking changes**: Detected via commit messages containing "BREAKING" or "!" prefix

### Registry Structure

Each component in `registry.json` includes:

```json
{
  "name": "event-card",
  "version": "0.12.0",
  "updatedAt": "2025-10-29T10:30:00Z",
  "type": "registry:block",
  "title": "Event Card",
  "registryDependencies": [],
  "dependencies": ["@nostr-dev-kit/ndk"],
  "files": [...]
}
```

### Version Manifest

A lightweight `versions.json` file is generated for quick version checks:

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

## Usage

### Update Versions

Run this before building/deploying:

```bash
cd registry
bun run registry:update
```

This will:
1. Scan Git history for all components
2. Calculate version numbers based on commit count
3. Update `registry.json` with version info
4. Generate `versions.json` manifest

### Individual Scripts

```bash
# Add versions to registry.json only
bun run registry:versions

# Generate versions.json manifest only
bun run registry:manifest
```

### Check Component Version

Users can check versions programmatically:

```bash
# Fetch version manifest
curl https://ndk.fyi/versions.json

# Check specific component
curl https://ndk.fyi/versions.json | jq '.components["event-card"]'
```

### In SvelteKit

```typescript
// Check if component has updates
const versions = await fetch('https://ndk.fyi/versions.json').then(r => r.json());
const eventCardVersion = versions.components['event-card'].version;
console.log(`Event Card version: ${eventCardVersion}`);
```

## Versioning Strategy

### Current Approach: Git-Based (0.x.0)

- **Major**: Always 0 (indicates beta/pre-release)
- **Minor**: Number of commits to component files
- **Patch**: Always 0 (reserved for future hotfixes)

### Future: Manual Semantic Versioning

Once components stabilize, switch to manual semver:

```json
{
  "name": "event-card",
  "version": "1.0.0",  // Manually set
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2025-11-01",
      "changes": [
        "Stable release",
        "Added support for custom actions",
        "BREAKING: Removed deprecated props"
      ]
    }
  ]
}
```

## Breaking Changes

### How to Mark Breaking Changes

When making breaking changes to a component:

1. Use conventional commit format:
   ```bash
   git commit -m "feat(event-card)!: remove deprecated eventId prop"
   # or
   git commit -m "BREAKING CHANGE: event-card now requires NDK v3"
   ```

2. The script will detect "!" or "BREAKING" in commit messages

3. Users will see a warning when checking versions

### Checking for Breaking Changes

```typescript
const versions = await fetch('https://ndk.fyi/versions.json').then(r => r.json());
const component = versions.components['event-card'];

// Check commit history for breaking changes
const hasBreaking = await checkBreakingChanges(component.lastModified);
```

## CI/CD Integration

### GitHub Actions

Add to your deployment workflow:

```yaml
- name: Update Component Versions
  run: |
    cd registry
    bun run registry:update

- name: Commit Updated Versions
  run: |
    git config --global user.name "github-actions[bot]"
    git config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"
    git add registry.json static/versions.json
    git diff --staged --quiet || git commit -m "chore: update component versions [skip ci]"
```

### Pre-build Hook

Or run automatically before each build:

```json
{
  "scripts": {
    "prebuild": "bun run registry:update",
    "build": "vite build"
  }
}
```

## API Endpoints

Your registry exposes these endpoints:

- `GET /registry.json` - Full registry with versions
- `GET /versions.json` - Lightweight version manifest
- `GET /registry/{component}` - Single component details (if you implement this)

## Best Practices

### 1. Run Before Every Release

```bash
bun run registry:update
git add registry.json static/versions.json
git commit -m "chore: update component versions"
```

### 2. Document Breaking Changes

Use detailed commit messages:

```bash
git commit -m "feat(event-card)!: change props API

BREAKING CHANGE:
- Removed `eventId` prop, use `event` instead
- `onAction` callback signature changed

Migration:
- Before: <EventCard eventId={id} />
- After: <EventCard event={eventObj} />
"
```

### 3. Test Version Detection

```bash
# See what versions would be assigned
bun run registry:versions

# Check the output
cat registry.json | jq '.items[] | {name, version, updatedAt}'
```

## Customization

### Change Version Format

Edit `scripts/add-component-versions.ts`:

```typescript
function calculateVersion(componentName: string, files: RegistryFile[]): string {
  // Custom version logic
  return `1.0.${commitCount}`;
}
```

### Add Changelog Support

Extend the script to generate changelogs from Git:

```typescript
function generateChangelog(componentName: string, files: RegistryFile[]): Changelog[] {
  // Parse git log and extract changes
  const commits = execSync(`git log --pretty=format:"%s" -- ${filePaths}`);
  // Format into changelog entries
}
```

### Manual Version Overrides

Create `version-overrides.json`:

```json
{
  "event-card": "2.0.0",
  "user-profile": "1.5.2"
}
```

Then modify the script to read overrides first.

## Migration from Non-Versioned

If you're adding this to an existing registry:

1. All components start at version `0.1.0` (or based on commit count)
2. Run `bun run registry:update` to generate initial versions
3. Optionally manually adjust versions in `registry.json`
4. Commit the updated registry

## Comparison with jsrepo

| Feature | This System | jsrepo |
|---------|-------------|--------|
| Version tracking | ✅ Git-based or manual | ✅ Manual semver |
| Update detection | ✅ Via versions.json | ✅ Via jsrepo CLI |
| Breaking changes | ✅ Git commit detection | ✅ Manual marking |
| Lightweight | ✅ JSON only | ❌ Requires CLI |
| Self-hosted | ✅ Full control | ❌ jsrepo.com platform |
| CLI updates | 🔄 Coming soon | ✅ Built-in |

## Future Enhancements

- [ ] CLI command: `npx @nostr-dev-kit/svelte check-updates`
- [ ] Visual diff tool on ndk.fyi
- [ ] Component-specific changelogs
- [ ] Deprecation warnings
- [ ] Version constraints in `registryDependencies`

## Questions?

See the main README or visit https://ndk.fyi/docs/registry
