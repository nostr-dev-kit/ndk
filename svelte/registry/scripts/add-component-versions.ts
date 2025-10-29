#!/usr/bin/env bun
/**
 * Script to automatically add version information to components in registry.json
 * based on Git history and last modification dates.
 *
 * Usage:
 *   bun run scripts/add-component-versions.ts
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';

interface RegistryFile {
  path: string;
  type: string;
}

interface RegistryItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  registryDependencies?: string[];
  dependencies?: string[];
  files: RegistryFile[];
  version?: string;
  updatedAt?: string;
  changelog?: Array<{
    version: string;
    date: string;
    changes: string[];
  }>;
}

interface Registry {
  $schema?: string;
  name: string;
  homepage?: string;
  version?: string;
  aliases?: Record<string, string>;
  items: RegistryItem[];
}

const REGISTRY_PATH = join(process.cwd(), 'registry.json');
const REGISTRY_OUTPUT_PATH = join(process.cwd(), '.vercel/output/static/registry.json');

/**
 * Convert registry path to actual source path
 * registry/ndk/event-card/... → src/lib/ndk/event-card/...
 */
function convertRegistryPathToSource(registryPath: string): string {
  return registryPath.replace(/^registry\//, 'src/lib/');
}

/**
 * Get the last Git commit date for a file
 */
function getLastCommitDate(filePath: string): string | null {
  try {
    const sourcePath = convertRegistryPathToSource(filePath);
    const absolutePath = join(process.cwd(), sourcePath);
    const date = execSync(
      `git log -1 --format=%cI -- "${absolutePath}"`,
      { encoding: 'utf-8' }
    ).trim();
    return date || null;
  } catch (error) {
    return null;
  }
}

/**
 * Get file modification date as fallback
 */
function getFileModDate(filePath: string): string {
  try {
    const sourcePath = convertRegistryPathToSource(filePath);
    const absolutePath = join(process.cwd(), sourcePath);
    const stats = statSync(absolutePath);
    return stats.mtime.toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
}

/**
 * Calculate a semantic version based on Git history
 * This is a simple heuristic - you might want to maintain versions manually
 */
function calculateVersion(componentName: string, files: RegistryFile[]): string {
  try {
    // Convert registry paths to source paths
    const sourcePaths = files.map(f => {
      const sourcePath = convertRegistryPathToSource(f.path);
      return join(process.cwd(), sourcePath);
    });

    // Get all commits that touched these files
    const filePaths = sourcePaths.join(' ');
    const commitCount = execSync(
      `git log --oneline -- ${filePaths} | wc -l`,
      { encoding: 'utf-8' }
    ).trim();

    const count = parseInt(commitCount) || 0;

    // Simple versioning: v0.count.0 (you can customize this)
    // Major version 0 for beta, minor = number of commits
    return `0.${count}.0`;
  } catch (error) {
    return '0.1.0';
  }
}

/**
 * Get the most recent update date from all component files
 */
function getMostRecentDate(files: RegistryFile[]): string {
  let mostRecent = new Date(0);

  for (const file of files) {
    const gitDate = getLastCommitDate(file.path);
    const date = gitDate ? new Date(gitDate) : new Date(getFileModDate(file.path));

    if (date > mostRecent) {
      mostRecent = date;
    }
  }

  return mostRecent.toISOString();
}

/**
 * Check if component has breaking changes (optional)
 * You can implement custom logic here
 */
function hasBreakingChanges(componentName: string, files: RegistryFile[]): boolean {
  try {
    // Convert registry paths to source paths
    const sourcePaths = files.map(f => {
      const sourcePath = convertRegistryPathToSource(f.path);
      return join(process.cwd(), sourcePath);
    });

    // Check commit messages for "BREAKING" or "!" prefix
    const filePaths = sourcePaths.join(' ');
    const breakingCommits = execSync(
      `git log --oneline --grep="BREAKING\\|!" -- ${filePaths}`,
      { encoding: 'utf-8' }
    ).trim();

    return breakingCommits.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Main function to add versions to registry
 */
async function addVersionsToRegistry() {
  console.log('📦 Adding component versions to registry...\n');

  // Read registry
  const registryContent = readFileSync(REGISTRY_PATH, 'utf-8');
  const registry: Registry = JSON.parse(registryContent);

  // Add registry-level version from package.json
  try {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), '../package.json'), 'utf-8'));
    registry.version = packageJson.version;
    console.log(`Registry version: ${registry.version}\n`);
  } catch (error) {
    console.log('Could not read package.json version\n');
  }

  // Process each component
  for (const item of registry.items) {
    const version = calculateVersion(item.name, item.files);
    const updatedAt = getMostRecentDate(item.files);
    const breaking = hasBreakingChanges(item.name, item.files);

    item.version = version;
    item.updatedAt = updatedAt;

    console.log(`✓ ${item.name.padEnd(30)} v${version}  ${new Date(updatedAt).toLocaleDateString()}`);

    if (breaking) {
      console.log(`  ⚠️  Has breaking changes`);
    }
  }

  // Write updated registry
  const updatedContent = JSON.stringify(registry, null, 2);
  writeFileSync(REGISTRY_PATH, updatedContent);

  // Also update the output version if it exists
  try {
    writeFileSync(REGISTRY_OUTPUT_PATH, updatedContent);
    console.log('\n✓ Updated registry.json and output registry');
  } catch (error) {
    console.log('\n✓ Updated registry.json');
  }

  console.log('\n🎉 Done! Component versions added successfully.');
}

// Run the script
addVersionsToRegistry().catch(console.error);
