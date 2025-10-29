#!/usr/bin/env bun
/**
 * Post-add hook for shadcn-svelte
 *
 * This script runs after shadcn-svelte adds a component and records
 * it in components.lock.json for version tracking.
 *
 * This would be called by a wrapper around shadcn-svelte add, or
 * integrated into components.json config.
 *
 * Usage:
 *   bun run scripts/post-add-hook.ts <component-name>
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

interface ComponentLockfile {
  $schema: string;
  registry: {
    name: string;
    url: string;
    version: string;
  };
  components: Record<string, {
    name: string;
    version: string;
    installedAt: string;
    source: string;
    files: string[];
  }>;
  lastChecked?: string;
}

const LOCKFILE_PATH = join(process.cwd(), 'components.lock.json');
const REGISTRY_URL = 'https://shadcn.ndk.fyi';

/**
 * Fetch component info from registry
 */
async function fetchComponentInfo(componentName: string) {
  try {
    const versionsUrl = `${REGISTRY_URL}/versions.json`;
    const response = await fetch(versionsUrl);
    const data = await response.json();

    return data.components[componentName];
  } catch (error) {
    console.warn(`⚠️  Could not fetch version info for ${componentName}`);
    return null;
  }
}

/**
 * Find installed component files
 * This looks in common locations where shadcn-svelte installs components
 */
function findComponentFiles(componentName: string): string[] {
  const possiblePaths = [
    `src/lib/components/ui/${componentName}/**/*`,
    `src/lib/components/${componentName}/**/*`,
    `src/lib/ui/${componentName}/**/*`,
  ];

  const files: string[] = [];

  for (const pattern of possiblePaths) {
    try {
      const matches = glob.sync(pattern, { cwd: process.cwd() });
      files.push(...matches);
    } catch (error) {
      // Path doesn't exist, continue
    }
  }

  return files;
}

/**
 * Initialize or read lockfile
 */
function getLockfile(): ComponentLockfile {
  if (existsSync(LOCKFILE_PATH)) {
    return JSON.parse(readFileSync(LOCKFILE_PATH, 'utf-8'));
  }

  // Create new lockfile
  return {
    $schema: 'https://shadcn.ndk.fyi/schema/components-lock.json',
    registry: {
      name: 'ndk-svelte',
      url: REGISTRY_URL,
      version: '0.0.0',
    },
    components: {},
    lastChecked: new Date().toISOString(),
  };
}

/**
 * Add component to lockfile
 */
async function trackComponent(componentName: string) {
  console.log(`\n📝 Tracking ${componentName} in components.lock.json...`);

  const lockfile = getLockfile();

  // Fetch version info
  const componentInfo = await fetchComponentInfo(componentName);
  const version = componentInfo?.version || '0.0.0';

  // Find installed files
  const files = findComponentFiles(componentName);

  // Add to lockfile
  lockfile.components[componentName] = {
    name: componentName,
    version,
    installedAt: new Date().toISOString(),
    source: REGISTRY_URL,
    files,
  };

  // Write lockfile
  writeFileSync(LOCKFILE_PATH, JSON.stringify(lockfile, null, 2));

  console.log(`✓ Tracked ${componentName}@${version}`);
  if (files.length > 0) {
    console.log(`  Files: ${files.length} file(s)`);
  }
  console.log();
}

/**
 * Main
 */
async function main() {
  const componentName = process.argv[2];

  if (!componentName) {
    console.error('Usage: bun run post-add-hook.ts <component-name>');
    process.exit(1);
  }

  await trackComponent(componentName);
}

if (import.meta.main) {
  main();
}

export { trackComponent, fetchComponentInfo, findComponentFiles };
