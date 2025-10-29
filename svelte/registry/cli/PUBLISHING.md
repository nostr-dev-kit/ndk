# Publishing the ndk-svelte CLI

## First-Time Setup

1. **Login to npm:**
   ```bash
   npm login
   ```

2. **Verify package name is available:**
   ```bash
   npm view ndk-svelte
   ```

   If it's taken, update `package.json` with a different name (e.g., `@ndk-svelte/cli`)

## Publishing a New Version

1. **Make sure everything is built:**
   ```bash
   cd cli
   bun run build
   ```

2. **Test locally before publishing:**
   ```bash
   # In the CLI directory
   npm link

   # In a test project
   ndk-svelte upgrade

   # Unlink when done
   npm unlink -g ndk-svelte
   ```

3. **Update version:**
   ```bash
   npm version patch   # 0.1.0 -> 0.1.1
   npm version minor   # 0.1.0 -> 0.2.0
   npm version major   # 0.1.0 -> 1.0.0
   ```

4. **Publish to npm:**
   ```bash
   npm publish
   ```

   Or if using a scoped package:
   ```bash
   npm publish --access public
   ```

5. **Verify it works:**
   ```bash
   # In any project
   npx ndk-svelte@latest upgrade
   ```

## Version Strategy

- **Patch** (0.1.x): Bug fixes, documentation updates
- **Minor** (0.x.0): New features, backwards-compatible changes
- **Major** (x.0.0): Breaking changes (once out of beta)

## Pre-release Versions

For testing before official release:

```bash
# Create beta version
npm version prerelease --preid=beta
# Results in: 0.1.1-beta.0

npm publish --tag beta

# Users can test with:
npx ndk-svelte@beta upgrade
```

## Automation (Future)

Consider setting up GitHub Actions to:
- Build and test on every PR
- Auto-publish on version tags
- Run integration tests

Example workflow location: `.github/workflows/publish.yml`
