#!/usr/bin/env bun
/**
 * Check for component updates
 *
 * Compares installed components (from components.lock.json) against
 * the latest versions available in the registry.
 *
 * Usage:
 *   bun run scripts/check-updates.ts
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ComponentLock {
  name: string;
  version: string;
  installedAt: string;
  source: string;
  files: string[];
}

interface ComponentLockfile {
  registry: {
    name: string;
    url: string;
    version: string;
  };
  components: Record<string, ComponentLock>;
  lastChecked?: string;
}

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

interface ComponentUpdate {
  name: string;
  title: string;
  currentVersion: string;
  latestVersion: string;
  lastModified: string;
  installedAt: string;
  daysSinceUpdate: number;
}

const LOCKFILE_PATH = join(process.cwd(), 'components.lock.json');

/**
 * Parse semantic version string
 */
function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const parts = version.split('.').map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

/**
 * Compare two versions
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 */
function compareVersions(a: string, b: string): number {
  const vA = parseVersion(a);
  const vB = parseVersion(b);

  if (vA.major !== vB.major) return vA.major - vB.major;
  if (vA.minor !== vB.minor) return vA.minor - vB.minor;
  return vA.patch - vB.patch;
}

/**
 * Fetch the latest version manifest
 */
async function fetchVersionManifest(registryUrl: string): Promise<VersionManifest> {
  const url = `${registryUrl}/versions.json`;
  console.log(`📡 Fetching latest versions from ${url}...`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`❌ Error fetching versions: ${error}`);
    throw error;
  }
}

/**
 * Read the component lock file
 */
function readLockfile(): ComponentLockfile | null {
  if (!existsSync(LOCKFILE_PATH)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(LOCKFILE_PATH, 'utf-8'));
  } catch (error) {
    console.error(`❌ Error reading lockfile: ${error}`);
    return null;
  }
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check for updates
 */
async function checkForUpdates(): Promise<ComponentUpdate[]> {
  // Read lockfile
  const lockfile = readLockfile();
  if (!lockfile) {
    console.error('\n❌ No components.lock.json found!');
    console.log('\n💡 This file tracks which components you have installed.');
    console.log('   It will be created automatically when you add components.\n');
    return [];
  }

  const installedComponents = Object.values(lockfile.components);

  if (installedComponents.length === 0) {
    console.log('\n📦 No components installed yet.\n');
    return [];
  }

  console.log(`\n📦 Found ${installedComponents.length} installed component(s)\n`);

  // Fetch latest versions
  const manifest = await fetchVersionManifest(lockfile.registry.url);
  console.log(`✓ Registry version: ${manifest.registry.version}\n`);

  // Check each component
  const updates: ComponentUpdate[] = [];

  for (const installed of installedComponents) {
    const latest = manifest.components[installed.name];

    if (!latest) {
      console.log(`⚠️  ${installed.name} - not found in registry`);
      continue;
    }

    const comparison = compareVersions(latest.version, installed.version);

    if (comparison > 0) {
      // Update available
      const daysSince = daysBetween(installed.installedAt, latest.lastModified);

      updates.push({
        name: installed.name,
        title: latest.title,
        currentVersion: installed.version,
        latestVersion: latest.version,
        lastModified: latest.lastModified,
        installedAt: installed.installedAt,
        daysSinceUpdate: daysSince,
      });
    }
  }

  return updates;
}

/**
 * Format and display updates
 */
function displayUpdates(updates: ComponentUpdate[]) {
  if (updates.length === 0) {
    console.log('✅ All components are up to date!\n');
    return;
  }

  console.log(`🔔 ${updates.length} component(s) have updates available:\n`);

  // Sort by version difference (most updates first)
  updates.sort((a, b) => {
    const diffA = parseVersion(a.latestVersion).minor - parseVersion(a.currentVersion).minor;
    const diffB = parseVersion(b.latestVersion).minor - parseVersion(b.currentVersion).minor;
    return diffB - diffA;
  });

  for (const update of updates) {
    const vDiff = parseVersion(update.latestVersion).minor - parseVersion(update.currentVersion).minor;

    console.log(`  📦 ${update.name}`);
    console.log(`     ${update.title}`);
    console.log(`     ${update.currentVersion} → ${update.latestVersion} (+${vDiff} update${vDiff !== 1 ? 's' : ''})`);
    console.log(`     Updated ${update.daysSinceUpdate} day${update.daysSinceUpdate !== 1 ? 's' : ''} ago`);
    console.log();
  }

  console.log('📝 To update a component, run:');
  console.log(`   npx shadcn-svelte@latest add ${updates[0].name}\n`);
}

/**
 * Main function
 */
async function main() {
  console.log('\n🔍 NDK Svelte Component Update Checker\n');
  console.log('━'.repeat(50));

  try {
    const updates = await checkForUpdates();
    console.log('━'.repeat(50));
    displayUpdates(updates);
  } catch (error) {
    console.error('\n❌ Failed to check for updates:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.main) {
  main();
}

export { checkForUpdates, compareVersions, parseVersion };
