#!/usr/bin/env bun
/**
 * Validate that registry.json is in sync with actual block files
 *
 * This script checks that:
 * 1. All blocks in the filesystem are in the registry
 * 2. All blocks in the registry exist in the filesystem
 * 3. Registry dependencies match actual imports
 *
 * Usage:
 *   bun run scripts/validate-registry.ts
 *
 * Exit codes:
 *   0 - Registry is valid and in sync
 *   1 - Registry is out of sync (errors found)
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, basename } from 'path';

const BLOCKS_DIR = join(process.cwd(), 'src/lib/ndk/blocks');
const REGISTRY_PATH = join(process.cwd(), 'registry.json');

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
}

interface Registry {
  items: RegistryItem[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Detect dependencies by analyzing imports in the file
 */
function detectDependencies(filePath: string): string[] {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const deps: string[] = [];

    if (content.includes("from '$lib/ndk/article-card'")) deps.push('article-card');
    if (content.includes("from '$lib/ndk/event-card'")) deps.push('event-card');
    if (content.includes("from '$lib/ndk/highlight-card'")) deps.push('highlight-card');
    if (content.includes("from '$lib/ndk/user-profile'")) deps.push('user-profile');
    if (content.includes("from '../src/lib/registry/ui/relay/index.js'

    return [...new Set(deps)];
  } catch (error) {
    return [];
  }
}

/**
 * Get all block files from filesystem
 */
function getBlockFiles(): Set<string> {
  const blocks = new Set<string>();

  if (!existsSync(BLOCKS_DIR)) {
    return blocks;
  }

  const files = readdirSync(BLOCKS_DIR)
    .filter(file => file.endsWith('.svelte'))
    .filter(file => file !== 'index.ts');

  for (const file of files) {
    blocks.add(basename(file, '.svelte'));
  }

  return blocks;
}

/**
 * Get all block items from registry
 */
function getRegistryBlocks(): Map<string, RegistryItem> {
  const blocks = new Map<string, RegistryItem>();

  if (!existsSync(REGISTRY_PATH)) {
    return blocks;
  }

  const content = readFileSync(REGISTRY_PATH, 'utf-8');
  const registry: Registry = JSON.parse(content);

  for (const item of registry.items) {
    // Check if this is a block (lives in blocks directory)
    const hasBlockFile = item.files.some(f =>
      f.path.includes('registry/ndk/blocks/')
    );

    if (hasBlockFile) {
      blocks.set(item.name, item);
    }
  }

  return blocks;
}

/**
 * Validate the registry
 */
function validateRegistry(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  console.log('🔍 Validating registry...\n');

  // Get blocks from both sources
  const fsBlocks = getBlockFiles();
  const registryBlocks = getRegistryBlocks();

  console.log(`📁 Filesystem blocks: ${fsBlocks.size}`);
  console.log(`📋 Registry blocks: ${registryBlocks.size}\n`);

  // Check for blocks in filesystem but not in registry
  const missingFromRegistry: string[] = [];
  for (const blockName of fsBlocks) {
    if (!registryBlocks.has(blockName)) {
      missingFromRegistry.push(blockName);
      result.errors.push(`Block "${blockName}" exists in filesystem but not in registry`);
      result.valid = false;
    }
  }

  // Check for blocks in registry but not in filesystem
  const missingFromFs: string[] = [];
  for (const [blockName, item] of registryBlocks) {
    if (!fsBlocks.has(blockName)) {
      missingFromFs.push(blockName);
      result.errors.push(`Block "${blockName}" exists in registry but not in filesystem`);
      result.valid = false;
    }
  }

  // Check for dependency mismatches
  const dependencyMismatches: string[] = [];
  for (const blockName of fsBlocks) {
    if (!registryBlocks.has(blockName)) continue;

    const filePath = join(BLOCKS_DIR, `${blockName}.svelte`);
    const actualDeps = detectDependencies(filePath);
    const registryDeps = registryBlocks.get(blockName)?.registryDependencies || [];

    const actualSet = new Set(actualDeps);
    const registrySet = new Set(registryDeps);

    // Check for missing deps in registry
    for (const dep of actualDeps) {
      if (!registrySet.has(dep)) {
        dependencyMismatches.push(blockName);
        result.warnings.push(
          `Block "${blockName}" imports from "${dep}" but doesn't list it in registryDependencies`
        );
      }
    }

    // Check for extra deps in registry
    for (const dep of registryDeps) {
      if (!actualSet.has(dep)) {
        dependencyMismatches.push(blockName);
        result.warnings.push(
          `Block "${blockName}" lists "${dep}" in registryDependencies but doesn't import from it`
        );
      }
    }
  }

  // Report results
  if (missingFromRegistry.length > 0) {
    console.log('❌ Blocks missing from registry:');
    missingFromRegistry.forEach(name => console.log(`   • ${name}`));
    console.log('');
  }

  if (missingFromFs.length > 0) {
    console.log('❌ Blocks in registry but not in filesystem:');
    missingFromFs.forEach(name => console.log(`   • ${name}`));
    console.log('');
  }

  if (dependencyMismatches.length > 0) {
    console.log('⚠️  Dependency mismatches found:');
    const uniqueMismatches = [...new Set(dependencyMismatches)];
    uniqueMismatches.forEach(name => {
      const warnings = result.warnings.filter(w => w.includes(`"${name}"`));
      console.log(`   • ${name}:`);
      warnings.forEach(w => console.log(`     ${w.replace(/Block "[^"]*" /, '')}`));
    });
    console.log('');
  }

  if (result.valid && result.warnings.length === 0) {
    console.log('✅ Registry is valid and in sync!\n');
  } else if (result.valid) {
    console.log('⚠️  Registry is valid but has warnings\n');
  } else {
    console.log('❌ Registry validation failed\n');
    console.log('💡 Fix by running: bun run scripts/generate-registry-from-blocks.ts\n');
  }

  return result;
}

/**
 * Main function
 */
async function main() {
  const result = validateRegistry();

  // Exit with error code if validation failed
  if (!result.valid) {
    process.exit(1);
  }

  // Exit with 0 even if there are warnings (warnings are non-fatal)
  process.exit(0);
}

main().catch(console.error);
