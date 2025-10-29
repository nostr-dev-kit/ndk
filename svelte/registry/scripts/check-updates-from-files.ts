#!/usr/bin/env bun
/**
 * Check for component updates by scanning the filesystem
 *
 * This script scans your project's component directory to detect
 * which NDK components are installed, then checks if updates are available.
 *
 * NO LOCKFILE NEEDED - just scans what's actually installed!
 *
 * Usage:
 *   bun run scripts/check-updates-from-files.ts
 *
 * Or download and run:
 *   curl -s https://ndk.fyi/scripts/check-updates-from-files.ts | bun run -
 */

import { readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

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

const REGISTRY_URL = process.env.NDK_REGISTRY_URL || 'https://shadcn.ndk.fyi';

// Common paths where shadcn-svelte installs components
const POSSIBLE_PATHS = [
  'src/lib/components/ui',
  'src/lib/components',
  'src/lib/ui',
  'lib/components/ui',
  'lib/components',
];

/**
 * Find the component directory in the user's project
 */
function findComponentDirectory(): string | null {
  for (const path of POSSIBLE_PATHS) {
    if (existsSync(path)) {
      return path;
    }
  }
  return null;
}

/**
 * Scan the filesystem for installed components
 */
function scanInstalledComponents(componentDir: string): string[] {
  try {
    const entries = readdirSync(componentDir, { withFileTypes: true });

    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .filter(name => !name.startsWith('.') && !name.startsWith('_'));
  } catch (error) {
    console.error(`Error scanning directory ${componentDir}:`, error);
    return [];
  }
}

/**
 * Get the last modified date of a component directory
 */
function getComponentLastModified(componentDir: string, componentName: string): Date {
  try {
    const componentPath = join(componentDir, componentName);
    const stats = statSync(componentPath);
    return stats.mtime;
  } catch (error) {
    return new Date(0);
  }
}

/**
 * Fetch the latest version manifest
 */
async function fetchVersionManifest(): Promise<VersionManifest | null> {
  const url = `${REGISTRY_URL}/versions.json`;

  try {
    console.log(`📡 Fetching latest versions from ${url}...\n`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Failed to fetch version manifest: ${error}`);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n🔍 NDK Svelte Component Update Checker (Filesystem Scanner)\n');
  console.log('━'.repeat(50));

  // Find component directory
  const componentDir = findComponentDirectory();

  if (!componentDir) {
    console.log('\n❌ Could not find component directory!');
    console.log('\nLooked in:');
    POSSIBLE_PATHS.forEach(path => console.log(`  - ${path}`));
    console.log('\nMake sure you have NDK components installed.\n');
    process.exit(1);
  }

  console.log(`📁 Scanning: ${componentDir}\n`);

  // Scan installed components
  const installedComponents = scanInstalledComponents(componentDir);

  if (installedComponents.length === 0) {
    console.log('📦 No components found in this directory.\n');
    console.log('Install components with:');
    console.log('  npx shadcn-svelte@latest add event-card\n');
    process.exit(0);
  }

  console.log(`📦 Found ${installedComponents.length} component(s):\n`);
  installedComponents.forEach(name => console.log(`   • ${name}`));
  console.log();

  // Fetch latest versions
  const manifest = await fetchVersionManifest();

  if (!manifest) {
    console.log('\n❌ Could not check for updates (network error)\n');
    process.exit(1);
  }

  console.log(`✓ Registry version: ${manifest.registry.version}\n`);
  console.log('━'.repeat(50));

  // Check each installed component
  const updates: Array<{
    name: string;
    title: string;
    version: string;
    lastModified: string;
    localModified: Date;
    isInRegistry: boolean;
  }> = [];

  const notInRegistry: string[] = [];

  for (const componentName of installedComponents) {
    const latest = manifest.components[componentName];

    if (!latest) {
      notInRegistry.push(componentName);
      continue;
    }

    const localModified = getComponentLastModified(componentDir, componentName);
    const remoteModified = new Date(latest.lastModified);

    updates.push({
      name: componentName,
      title: latest.title,
      version: latest.version,
      lastModified: latest.lastModified,
      localModified,
      isInRegistry: true,
    });
  }

  // Display results
  if (updates.length === 0 && notInRegistry.length === 0) {
    console.log('\n✅ All components are up to date!\n');
    return;
  }

  // Show components in registry
  if (updates.length > 0) {
    console.log(`\n📦 ${updates.length} NDK component(s) installed:\n`);

    for (const component of updates) {
      const daysSinceUpdate = Math.ceil(
        (Date.now() - new Date(component.lastModified).getTime()) / (1000 * 60 * 60 * 24)
      );

      const daysSinceLocal = Math.ceil(
        (Date.now() - component.localModified.getTime()) / (1000 * 60 * 60 * 24)
      );

      console.log(`  📦 ${component.name}`);
      console.log(`     ${component.title}`);
      console.log(`     Registry version: v${component.version}`);
      console.log(`     Registry updated: ${daysSinceUpdate} day(s) ago`);
      console.log(`     Your files modified: ${daysSinceLocal} day(s) ago`);

      if (daysSinceLocal > daysSinceUpdate + 7) {
        console.log(`     ⚠️  Your version might be outdated`);
      }

      console.log();
    }

    console.log('💡 To update a component, run:');
    console.log(`   npx shadcn-svelte@latest add ${updates[0].name}\n`);
  }

  // Show components not in registry
  if (notInRegistry.length > 0) {
    console.log(`\n⚠️  ${notInRegistry.length} component(s) not found in NDK registry:\n`);
    notInRegistry.forEach(name => console.log(`   • ${name}`));
    console.log('\n   These might be custom components or from other sources.\n');
  }

  console.log('━'.repeat(50));
  console.log('\n✅ Update check complete!\n');
}

// Run
if (import.meta.main) {
  main().catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
}

export { scanInstalledComponents, findComponentDirectory, fetchVersionManifest };
