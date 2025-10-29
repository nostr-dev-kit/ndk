#!/usr/bin/env bun
/**
 * Add version headers to all component files
 *
 * This script adds a version comment to the top of each component file:
 * <!-- @ndk-version: event-card@0.12.0 -->
 *
 * Usage:
 *   bun run scripts/add-version-headers.ts
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

interface RegistryItem {
  name: string;
  version?: string;
  files: Array<{ path: string; type: string }>;
}

interface Registry {
  items: RegistryItem[];
}

const REGISTRY_PATH = join(process.cwd(), 'registry.json');

/**
 * Get version header comment for a file type
 */
function getVersionHeader(componentName: string, version: string, fileExt: string): string {
  const versionString = `@ndk-version: ${componentName}@${version}`;

  switch (fileExt) {
    case '.svelte':
      return `<!-- ${versionString} -->\n`;
    case '.ts':
    case '.js':
      return `// ${versionString}\n`;
    default:
      return `// ${versionString}\n`;
  }
}

/**
 * Check if file already has a version header
 */
function hasVersionHeader(content: string): boolean {
  return content.includes('@ndk-version:');
}

/**
 * Remove existing version header
 */
function removeVersionHeader(content: string): string {
  // Remove HTML comment version
  content = content.replace(/<!--\s*@ndk-version:.*?-->\n?/g, '');
  // Remove JS/TS comment version
  content = content.replace(/\/\/\s*@ndk-version:.*?\n/g, '');
  return content;
}

/**
 * Convert registry path to actual source path
 * registry/ndk/event-card/... -> src/lib/ndk/event-card/...
 */
function convertRegistryPathToSource(registryPath: string): string {
  // Replace "registry/" prefix with "src/lib/"
  return registryPath.replace(/^registry\//, 'src/lib/');
}

/**
 * Add version header to a file
 */
function addVersionHeaderToFile(
  filePath: string,
  componentName: string,
  version: string
): boolean {
  try {
    // Convert registry path to actual source path
    const sourcePath = convertRegistryPathToSource(filePath);
    const absolutePath = join(process.cwd(), sourcePath);

    const content = readFileSync(absolutePath, 'utf-8');
    const ext = extname(filePath);

    // Remove existing header if present
    const cleanContent = removeVersionHeader(content);

    // Add new header
    const header = getVersionHeader(componentName, version, ext);
    const newContent = header + cleanContent;

    // Write back
    writeFileSync(absolutePath, newContent, 'utf-8');
    return true;
  } catch (error) {
    console.warn(`  ⚠️  Could not update ${filePath}: ${error}`);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('📝 Adding version headers to component files...\n');

  // Read registry
  const registry: Registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));

  let totalFiles = 0;
  let updatedFiles = 0;

  // Process each component
  for (const item of registry.items) {
    const version = item.version || '0.0.0';
    console.log(`📦 ${item.name} v${version}`);

    for (const file of item.files) {
      totalFiles++;

      // Only add headers to source files (not JSON, CSS, etc.)
      const ext = extname(file.path);
      if (!['.svelte', '.ts', '.js'].includes(ext)) {
        console.log(`  ⏭️  Skipping ${file.path} (not a source file)`);
        continue;
      }

      const success = addVersionHeaderToFile(file.path, item.name, version);
      if (success) {
        updatedFiles++;
        console.log(`  ✓ ${file.path}`);
      }
    }

    console.log();
  }

  console.log('━'.repeat(50));
  console.log(`✅ Updated ${updatedFiles}/${totalFiles} files with version headers\n`);
}

if (import.meta.main) {
  main();
}

export { addVersionHeaderToFile, getVersionHeader, removeVersionHeader };
