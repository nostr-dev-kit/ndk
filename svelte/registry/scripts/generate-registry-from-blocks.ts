#!/usr/bin/env bun
/**
 * Auto-generate registry.json entries for all block components
 *
 * This script scans the blocks directory and generates/updates registry entries
 * to ensure the registry never goes out of sync with actual files.
 *
 * Usage:
 *   bun run scripts/generate-registry-from-blocks.ts [--dry-run]
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
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
  title: string;
  description: string;
  registryDependencies: string[];
  dependencies: string[];
  files: RegistryFile[];
  version?: string;
  updatedAt?: string;
}

interface Registry {
  $schema?: string;
  name: string;
  homepage?: string;
  version?: string;
  aliases?: Record<string, string>;
  items: RegistryItem[];
}

/**
 * Convert kebab-case to Title Case
 */
function toTitleCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Determine registry dependencies by analyzing imports in the file
 */
function detectDependencies(filePath: string): string[] {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const deps: string[] = [];

    // Check for imports from parent components
    if (content.includes("from '$lib/ndk/article-card'")) {
      deps.push('article-card');
    }
    if (content.includes("from '$lib/ndk/event-card'")) {
      deps.push('event-card');
    }
    if (content.includes("from '$lib/ndk/highlight-card'")) {
      deps.push('highlight-card');
    }
    if (content.includes("from '$lib/ndk/user-profile'")) {
      deps.push('user-profile');
    }
    if (content.includes("from '$lib/ndk/relay-card'")) {
      deps.push('relay-card');
    }

    return [...new Set(deps)];
  } catch (error) {
    return [];
  }
}

/**
 * Generate a description based on the component name and type
 */
function generateDescription(componentName: string, dependencies: string[]): string {
  const name = componentName.replace(/-/g, ' ');

  if (dependencies.length > 0) {
    const parent = dependencies[0].replace(/-/g, ' ');
    return `Preset block for ${parent} - ${name} layout`;
  }

  // Default descriptions based on patterns
  if (componentName.includes('follow')) {
    return `Follow button component - ${name} variant`;
  }
  if (componentName.includes('mute')) {
    return `Mute button component - ${name} variant`;
  }
  if (componentName.includes('reaction')) {
    return `Reaction component - ${name} variant`;
  }
  if (componentName.includes('repost')) {
    return `Repost button component - ${name} variant`;
  }
  if (componentName.includes('user-card')) {
    return `User card component - ${name} layout`;
  }
  if (componentName.includes('relay-card')) {
    return `Relay card component - ${name} layout`;
  }
  if (componentName.includes('thread-view')) {
    return `Thread view component - ${name} layout`;
  }

  return `Block component - ${name}`;
}

/**
 * Scan blocks directory and generate registry items
 */
function generateRegistryItems(): RegistryItem[] {
  const items: RegistryItem[] = [];

  if (!existsSync(BLOCKS_DIR)) {
    console.error(`❌ Blocks directory not found: ${BLOCKS_DIR}`);
    return items;
  }

  const files = readdirSync(BLOCKS_DIR)
    .filter(file => file.endsWith('.svelte'))
    .filter(file => file !== 'index.ts');

  for (const file of files) {
    const componentName = basename(file, '.svelte');
    const filePath = join(BLOCKS_DIR, file);
    const registryDeps = detectDependencies(filePath);

    const item: RegistryItem = {
      name: componentName,
      type: 'registry:component',
      title: toTitleCase(componentName),
      description: generateDescription(componentName, registryDeps),
      registryDependencies: registryDeps,
      dependencies: [
        '@nostr-dev-kit/ndk',
        '@nostr-dev-kit/svelte'
      ],
      files: [
        {
          path: `registry/ndk/blocks/${file}`,
          type: 'registry:ui'
        }
      ]
    };

    items.push(item);
  }

  return items.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Merge generated items with existing registry
 */
function mergeWithRegistry(generatedItems: RegistryItem[]): Registry {
  let registry: Registry;

  if (existsSync(REGISTRY_PATH)) {
    const content = readFileSync(REGISTRY_PATH, 'utf-8');
    registry = JSON.parse(content);
  } else {
    registry = {
      $schema: 'https://shadcn-svelte.com/schema/registry.json',
      name: 'ndk-svelte',
      homepage: 'https://ndk.fyi',
      aliases: {
        lib: '$lib',
        ndk: '@nostr-dev-kit/ndk',
        'ndk-svelte': '@nostr-dev-kit/svelte',
        builders: '$lib/builders',
        ui: '$lib/ui',
        utils: '$lib/utils'
      },
      items: []
    };
  }

  // Create a map of existing items by name
  const existingMap = new Map<string, RegistryItem>();
  for (const item of registry.items) {
    existingMap.set(item.name, item);
  }

  // Track which block items we've seen
  const blockNames = new Set(generatedItems.map(item => item.name));

  // Update or add generated items
  const updatedItems: RegistryItem[] = [];
  const addedItems: string[] = [];
  const updatedItemNames: string[] = [];

  for (const generated of generatedItems) {
    const existing = existingMap.get(generated.name);

    if (existing) {
      // Preserve version and updatedAt from existing
      generated.version = existing.version;
      generated.updatedAt = existing.updatedAt;
      updatedItemNames.push(generated.name);
    } else {
      addedItems.push(generated.name);
    }

    updatedItems.push(generated);
    existingMap.delete(generated.name);
  }

  // Add non-block items from existing registry
  for (const [name, item] of existingMap) {
    updatedItems.push(item);
  }

  // Sort items: blocks first, then others
  updatedItems.sort((a, b) => {
    const aIsBlock = blockNames.has(a.name);
    const bIsBlock = blockNames.has(b.name);

    if (aIsBlock && !bIsBlock) return 1;
    if (!aIsBlock && bIsBlock) return -1;
    return a.name.localeCompare(b.name);
  });

  registry.items = updatedItems;

  // Report
  console.log('\n📊 Registry Update Summary:');
  console.log(`   ✨ Added: ${addedItems.length} blocks`);
  console.log(`   🔄 Updated: ${updatedItemNames.length} blocks`);
  console.log(`   📦 Total blocks: ${generatedItems.length}`);
  console.log(`   📋 Total items: ${updatedItems.length}`);

  if (addedItems.length > 0) {
    console.log('\n✨ New blocks added:');
    addedItems.forEach(name => console.log(`   • ${name}`));
  }

  return registry;
}

/**
 * Main function
 */
async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log('🔍 Scanning blocks directory...\n');

  const generatedItems = generateRegistryItems();
  console.log(`Found ${generatedItems.length} block components\n`);

  const registry = mergeWithRegistry(generatedItems);

  if (isDryRun) {
    console.log('\n🔍 Dry run - would write to registry.json:');
    console.log(JSON.stringify(registry, null, 2));
  } else {
    writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');
    console.log(`\n✅ Registry updated: ${REGISTRY_PATH}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Run: bun run registry:update');
    console.log('   2. Review changes: git diff registry.json');
    console.log('   3. Commit if changes look good\n');
  }
}

main().catch(console.error);
