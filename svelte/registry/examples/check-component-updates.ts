/**
 * Example: Check for component updates
 *
 * This shows how users can programmatically check if their installed
 * components have updates available.
 */

interface VersionManifest {
  registry: {
    name: string;
    version: string;
    generated: string;
  };
  components: Record<string, {
    version: string;
    lastModified: string;
    type: string;
    title: string;
  }>;
}

interface InstalledComponent {
  name: string;
  version: string;
  installedAt: string;
}

/**
 * Fetch the latest version manifest from the registry
 */
async function fetchVersionManifest(): Promise<VersionManifest> {
  const response = await fetch('https://shadcn.ndk.fyi/versions.json');
  return response.json();
}

/**
 * Check if a component has updates available
 */
function hasUpdate(installed: InstalledComponent, latest: VersionManifest): boolean {
  const latestComponent = latest.components[installed.name];
  if (!latestComponent) return false;

  // Simple version comparison (you'd use semver in production)
  return latestComponent.version !== installed.version;
}

/**
 * Get all components that have updates
 */
async function checkForUpdates(installed: InstalledComponent[]): Promise<{
  component: string;
  currentVersion: string;
  latestVersion: string;
  lastModified: string;
}[]> {
  const manifest = await fetchVersionManifest();
  const updates = [];

  for (const component of installed) {
    if (hasUpdate(component, manifest)) {
      const latest = manifest.components[component.name];
      updates.push({
        component: component.name,
        currentVersion: component.version,
        latestVersion: latest.version,
        lastModified: latest.lastModified,
      });
    }
  }

  return updates;
}

/**
 * Example usage
 */
async function main() {
  // Simulate installed components (in a real app, read from a lock file)
  const installed: InstalledComponent[] = [
    {
      name: 'event-card',
      version: '0.8.0',
      installedAt: '2025-10-15T10:00:00Z',
    },
    {
      name: 'user-profile',
      version: '0.12.0',
      installedAt: '2025-10-20T14:30:00Z',
    },
    {
      name: 'zap-button',
      version: '0.5.0',
      installedAt: '2025-10-10T09:00:00Z',
    },
  ];

  console.log('🔍 Checking for component updates...\n');

  const updates = await checkForUpdates(installed);

  if (updates.length === 0) {
    console.log('✅ All components are up to date!');
  } else {
    console.log(`📦 ${updates.length} component(s) have updates:\n`);

    for (const update of updates) {
      console.log(`  ${update.component}`);
      console.log(`    ${update.currentVersion} → ${update.latestVersion}`);
      console.log(`    Last updated: ${new Date(update.lastModified).toLocaleDateString()}\n`);
    }

    console.log('Run `npx shadcn-svelte@latest add <component>` to update');
  }
}

// Run if executed directly
if (import.meta.main) {
  main().catch(console.error);
}

export { checkForUpdates, fetchVersionManifest, hasUpdate };
