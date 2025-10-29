#!/usr/bin/env bun
/**
 * Generate a separate version manifest for easy querying
 * This creates a lightweight file that clients can check for updates
 *
 * Usage:
 *   bun run scripts/generate-version-manifest.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface RegistryItem {
  name: string;
  version?: string;
  updatedAt?: string;
  type: string;
  title?: string;
  registryDependencies?: string[];
  dependencies?: string[];
}

interface Registry {
  name: string;
  version?: string;
  items: RegistryItem[];
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
    dependencies: string[];
    registryDependencies: string[];
  }>;
}

const REGISTRY_PATH = join(process.cwd(), 'registry.json');
const MANIFEST_PATH = join(process.cwd(), 'static/versions.json');
const MANIFEST_OUTPUT_PATH = join(process.cwd(), '.vercel/output/static/versions.json');

async function generateVersionManifest() {
  console.log('📋 Generating version manifest...\n');

  // Read registry
  const registryContent = readFileSync(REGISTRY_PATH, 'utf-8');
  const registry: Registry = JSON.parse(registryContent);

  // Build manifest
  const manifest: VersionManifest = {
    registry: {
      name: registry.name,
      version: registry.version || '0.0.0',
      generated: new Date().toISOString(),
    },
    components: {},
  };

  for (const item of registry.items) {
    manifest.components[item.name] = {
      version: item.version || '0.0.0',
      lastModified: item.updatedAt || new Date().toISOString(),
      type: item.type,
      title: item.title || item.name,
      dependencies: item.dependencies || [],
      registryDependencies: item.registryDependencies || [],
    };
  }

  // Write manifest
  const manifestContent = JSON.stringify(manifest, null, 2);

  try {
    writeFileSync(MANIFEST_PATH, manifestContent);
    console.log('✓ Created static/versions.json');
  } catch (error) {
    console.log('Could not write to static/versions.json');
  }

  try {
    writeFileSync(MANIFEST_OUTPUT_PATH, manifestContent);
    console.log('✓ Created .vercel/output/static/versions.json');
  } catch (error) {
    console.log('Could not write to .vercel/output/static/versions.json');
  }

  console.log(`\n📊 Generated manifest for ${Object.keys(manifest.components).length} components`);
  console.log(`   Registry version: ${manifest.registry.version}`);
  console.log('\n🎉 Done!');
}

generateVersionManifest().catch(console.error);
