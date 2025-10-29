#!/usr/bin/env bun
/**
 * Create a component lock file to track installed components
 *
 * This integrates with shadcn-svelte CLI to track which components
 * are installed and at what version.
 *
 * Usage:
 *   bun run scripts/create-lockfile.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ComponentLock {
  name: string;
  version: string;
  installedAt: string;
  source: string;
  files: string[];
}

interface ComponentLockfile {
  $schema: string;
  registry: {
    name: string;
    url: string;
    version: string;
  };
  components: Record<string, ComponentLock>;
  lastChecked?: string;
}

const LOCKFILE_PATH = join(process.cwd(), 'components.lock.json');

/**
 * Initialize a new lock file
 */
function createLockfile(registryUrl: string = 'https://ndk.fyi'): ComponentLockfile {
  return {
    $schema: 'https://ndk.fyi/schema/components-lock.json',
    registry: {
      name: 'ndk-svelte',
      url: registryUrl,
      version: '0.0.0',
    },
    components: {},
    lastChecked: new Date().toISOString(),
  };
}

/**
 * Read existing lock file or create new one
 */
function readLockfile(): ComponentLockfile {
  if (existsSync(LOCKFILE_PATH)) {
    return JSON.parse(readFileSync(LOCKFILE_PATH, 'utf-8'));
  }
  return createLockfile();
}

/**
 * Write lock file
 */
function writeLockfile(lockfile: ComponentLockfile) {
  writeFileSync(LOCKFILE_PATH, JSON.stringify(lockfile, null, 2));
}

/**
 * Add a component to the lock file
 */
async function addComponent(
  name: string,
  version: string,
  files: string[]
) {
  const lockfile = readLockfile();

  lockfile.components[name] = {
    name,
    version,
    installedAt: new Date().toISOString(),
    source: lockfile.registry.url,
    files,
  };

  writeLockfile(lockfile);
  console.log(`✓ Added ${name}@${version} to components.lock.json`);
}

/**
 * Remove a component from the lock file
 */
async function removeComponent(name: string) {
  const lockfile = readLockfile();

  if (lockfile.components[name]) {
    delete lockfile.components[name];
    writeLockfile(lockfile);
    console.log(`✓ Removed ${name} from components.lock.json`);
  }
}

/**
 * Update last checked timestamp
 */
function updateLastChecked() {
  const lockfile = readLockfile();
  lockfile.lastChecked = new Date().toISOString();
  writeLockfile(lockfile);
}

export {
  createLockfile,
  readLockfile,
  writeLockfile,
  addComponent,
  removeComponent,
  updateLastChecked,
};

// CLI usage
if (import.meta.main) {
  const command = process.argv[2];
  const componentName = process.argv[3];
  const version = process.argv[4];
  const files = process.argv.slice(5);

  switch (command) {
    case 'init':
      const lockfile = createLockfile();
      writeLockfile(lockfile);
      console.log('✓ Created components.lock.json');
      break;

    case 'add':
      if (!componentName || !version) {
        console.error('Usage: bun run create-lockfile.ts add <name> <version> [files...]');
        process.exit(1);
      }
      await addComponent(componentName, version, files);
      break;

    case 'remove':
      if (!componentName) {
        console.error('Usage: bun run create-lockfile.ts remove <name>');
        process.exit(1);
      }
      await removeComponent(componentName);
      break;

    default:
      console.log('Usage:');
      console.log('  bun run create-lockfile.ts init');
      console.log('  bun run create-lockfile.ts add <name> <version> [files...]');
      console.log('  bun run create-lockfile.ts remove <name>');
  }
}
