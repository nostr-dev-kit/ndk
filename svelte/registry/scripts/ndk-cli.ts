#!/usr/bin/env bun
/**
 * NDK Svelte Component CLI
 *
 * A wrapper around shadcn-svelte that adds version tracking
 * and update checking.
 *
 * Usage:
 *   npx ndk-svelte add <component>
 *   npx ndk-svelte check-updates
 *   npx ndk-svelte list
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const LOCKFILE_PATH = join(process.cwd(), 'components.lock.json');

interface ComponentLockfile {
  registry: {
    name: string;
    url: string;
    version: string;
  };
  components: Record<string, {
    name: string;
    version: string;
    installedAt: string;
  }>;
}

/**
 * Add a component using shadcn-svelte, then track it
 */
async function addComponent(componentName: string) {
  console.log(`\n📦 Installing ${componentName}...\n`);

  try {
    // Run shadcn-svelte add
    execSync(`npx shadcn-svelte@latest add ${componentName}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    // Track the component
    console.log('\n📝 Updating component lock file...');
    execSync(`bun run scripts/post-add-hook.ts ${componentName}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    console.log(`\n✅ ${componentName} installed successfully!`);
  } catch (error) {
    console.error(`\n❌ Failed to install ${componentName}`);
    process.exit(1);
  }
}

/**
 * Check for updates
 */
async function checkUpdates() {
  try {
    execSync('bun run scripts/check-updates.ts', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  } catch (error) {
    console.error('❌ Failed to check for updates');
    process.exit(1);
  }
}

/**
 * List installed components
 */
function listComponents() {
  if (!existsSync(LOCKFILE_PATH)) {
    console.log('\n📦 No components installed yet.\n');
    return;
  }

  const lockfile: ComponentLockfile = JSON.parse(readFileSync(LOCKFILE_PATH, 'utf-8'));
  const components = Object.values(lockfile.components);

  if (components.length === 0) {
    console.log('\n📦 No components installed yet.\n');
    return;
  }

  console.log(`\n📦 Installed Components (${components.length}):\n`);

  for (const component of components) {
    const installedDate = new Date(component.installedAt).toLocaleDateString();
    console.log(`  ${component.name.padEnd(30)} v${component.version.padEnd(10)} (${installedDate})`);
  }

  console.log();
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
NDK Svelte Component CLI

Usage:
  ndk-svelte add <component>       Install a component from the NDK registry
  ndk-svelte check-updates         Check for component updates
  ndk-svelte list                  List installed components
  ndk-svelte help                  Show this help message

Examples:
  ndk-svelte add event-card
  ndk-svelte check-updates
  ndk-svelte list

For more information, visit: https://ndk.fyi
  `);
}

/**
 * Main CLI
 */
async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'add':
      if (!arg) {
        console.error('❌ Please specify a component name');
        console.log('Usage: ndk-svelte add <component>');
        process.exit(1);
      }
      await addComponent(arg);
      break;

    case 'check-updates':
    case 'check':
    case 'updates':
      await checkUpdates();
      break;

    case 'list':
    case 'ls':
      listComponents();
      break;

    case 'help':
    case '--help':
    case '-h':
    case undefined:
      showHelp();
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
