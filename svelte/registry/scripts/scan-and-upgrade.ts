#!/usr/bin/env bun
/**
 * Scan for installed NDK components and check for upgrades
 *
 * This scans all .svelte, .ts, and .js files for version headers:
 * <!-- @ndk-version: event-card@0.8.0 -->
 *
 * Then compares against the registry to find available upgrades.
 *
 * Usage:
 *   npx ndk-shadcn upgrade
 *   or
 *   bun run scripts/scan-and-upgrade.ts
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

interface VersionManifest {
  registry: {
    name: string;
    version: string;
  };
  components: Record<string, {
    version: string;
    lastModified: string;
    title: string;
  }>;
}

interface InstalledComponent {
  name: string;
  version: string;
  files: string[];
}

const REGISTRY_URL = process.env.NDK_REGISTRY_URL || 'https://ndk.fyi';

// For local testing, check if local versions.json exists
const LOCAL_VERSIONS_PATH = '.vercel/output/static/versions.json';
const SCAN_DIRS = ['src', 'lib'];

/**
 * Extract version from file content
 * Matches: @ndk-version: component-name@1.2.3
 */
function extractVersion(content: string): { name: string; version: string } | null {
  // Match HTML comment: <!-- @ndk-version: event-card@0.8.0 -->
  const htmlMatch = content.match(/<!--\s*@ndk-version:\s*([^@\s]+)@([^\s]+)\s*-->/);
  if (htmlMatch) {
    return { name: htmlMatch[1], version: htmlMatch[2] };
  }

  // Match JS/TS comment: // @ndk-version: event-card@0.8.0
  const jsMatch = content.match(/\/\/\s*@ndk-version:\s*([^@\s]+)@([^\s]+)/);
  if (jsMatch) {
    return { name: jsMatch[1], version: jsMatch[2] };
  }

  return null;
}

/**
 * Recursively scan directory for component files
 */
function scanDirectory(dir: string, basePath: string = dir): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // Skip node_modules, .git, etc
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }

      if (entry.isDirectory()) {
        files.push(...scanDirectory(fullPath, basePath));
      } else if (entry.isFile()) {
        const ext = extname(entry.name);
        if (['.svelte', '.ts', '.js'].includes(ext)) {
          // Store relative path from base
          const relativePath = fullPath.replace(basePath + '/', '');
          files.push(relativePath);
        }
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }

  return files;
}

/**
 * Scan all files for NDK version headers
 */
function scanForInstalledComponents(): Map<string, InstalledComponent> {
  const components = new Map<string, InstalledComponent>();

  console.log('🔍 Scanning project for NDK components...\n');

  for (const dir of SCAN_DIRS) {
    if (!readdirSync('.').includes(dir)) continue;

    const files = scanDirectory(dir);
    console.log(`📁 Scanning ${dir}/ (${files.length} files)`);

    for (const file of files) {
      try {
        // file is relative to dir, so prepend dir
        const fullFilePath = join(dir, file);
        const content = readFileSync(fullFilePath, 'utf-8');
        const version = extractVersion(content);

        if (version) {
          if (!components.has(version.name)) {
            components.set(version.name, {
              name: version.name,
              version: version.version,
              files: [],
            });
          }

          components.get(version.name)!.files.push(fullFilePath);
        }
      } catch (error) {
        // Can't read file, skip
      }
    }
  }

  return components;
}

/**
 * Fetch latest versions from registry
 */
async function fetchVersionManifest(): Promise<VersionManifest | null> {
  const url = `${REGISTRY_URL}/versions.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`❌ Failed to fetch versions: ${error}`);
    return null;
  }
}

/**
 * Compare versions (simple semver comparison)
 */
function compareVersions(current: string, latest: string): number {
  const c = current.split('.').map(Number);
  const l = latest.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const cv = c[i] || 0;
    const lv = l[i] || 0;
    if (cv < lv) return -1;
    if (cv > lv) return 1;
  }

  return 0;
}

/**
 * Prompt user to upgrade a component
 */
async function promptUpgrade(componentName: string): Promise<boolean> {
  console.log(`\n❓ Upgrade ${componentName}? (y/n)`);

  // In a real CLI, you'd use a prompt library
  // For now, we'll just return true to show the flow
  return true;
}

/**
 * Upgrade a component using shadcn-svelte
 */
function upgradeComponent(componentName: string) {
  console.log(`\n📦 Upgrading ${componentName}...`);

  try {
    execSync(`npx shadcn-svelte@latest add ${componentName}`, {
      stdio: 'inherit',
    });
    console.log(`✅ ${componentName} upgraded successfully!`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to upgrade ${componentName}`);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const autoUpgrade = args.includes('--yes') || args.includes('-y');

  console.log('\n🚀 NDK Svelte Component Upgrade Tool\n');
  console.log('━'.repeat(50));

  // Scan for installed components
  const installed = scanForInstalledComponents();

  if (installed.size === 0) {
    console.log('\n📦 No NDK components found.');
    console.log('   (Looking for @ndk-version headers in source files)\n');
    return;
  }

  console.log(`\n✓ Found ${installed.size} NDK component(s):\n`);
  for (const [name, info] of installed) {
    console.log(`  📦 ${name} v${info.version} (${info.files.length} file(s))`);
  }

  // Fetch latest versions
  console.log(`\n📡 Checking for updates from ${REGISTRY_URL}...\n`);

  const manifest = await fetchVersionManifest();
  if (!manifest) {
    console.log('❌ Could not fetch version information\n');
    return;
  }

  console.log(`✓ Registry version: ${manifest.registry.version}\n`);
  console.log('━'.repeat(50));

  // Check for upgrades
  const upgrades: Array<{
    name: string;
    currentVersion: string;
    latestVersion: string;
    title: string;
  }> = [];

  for (const [name, info] of installed) {
    const latest = manifest.components[name];

    if (!latest) {
      console.log(`\n⚠️  ${name} not found in registry (custom component?)`);
      continue;
    }

    const comparison = compareVersions(info.version, latest.version);

    if (comparison < 0) {
      upgrades.push({
        name,
        currentVersion: info.version,
        latestVersion: latest.version,
        title: latest.title,
      });
    }
  }

  // Show results
  if (upgrades.length === 0) {
    console.log('\n✅ All components are up to date!\n');
    return;
  }

  console.log(`\n🔔 ${upgrades.length} component(s) can be upgraded:\n`);

  for (const upgrade of upgrades) {
    console.log(`  📦 ${upgrade.name}`);
    console.log(`     ${upgrade.title}`);
    console.log(`     ${upgrade.currentVersion} → ${upgrade.latestVersion}`);
    console.log();
  }

  // Offer to upgrade
  if (!autoUpgrade) {
    console.log('💡 To upgrade all components, run:');
    console.log('   npx ndk-shadcn upgrade --yes\n');
    console.log('   Or upgrade individually:');
    for (const upgrade of upgrades) {
      console.log(`   npx shadcn-svelte@latest add ${upgrade.name}`);
    }
    console.log();
  } else {
    console.log('🚀 Upgrading all components...\n');

    let upgraded = 0;
    for (const upgrade of upgrades) {
      if (upgradeComponent(upgrade.name)) {
        upgraded++;
      }
    }

    console.log(`\n✅ Upgraded ${upgraded}/${upgrades.length} component(s)\n`);
  }
}

if (import.meta.main) {
  main().catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
}

export { scanForInstalledComponents, extractVersion, compareVersions };
