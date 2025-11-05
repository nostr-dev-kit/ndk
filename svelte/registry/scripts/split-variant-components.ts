#!/usr/bin/env bun
/**
 * Split variant components into their own directories
 * This makes each variant component independently installable via jsrepo
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename } from 'path';

const REGISTRY_DIR = join(process.cwd(), 'src/lib/registry');
const COMPONENTS_DIR = join(REGISTRY_DIR, 'components');

// List of variant components that need to be split
const VARIANTS_TO_SPLIT = [
  // article-card variants
  { parent: 'article-card', variant: 'article-card-hero' },
  { parent: 'article-card', variant: 'article-card-neon' },
  { parent: 'article-card', variant: 'article-card-portrait' },

  // article-embedded variants
  { parent: 'article-embedded', variant: 'article-embedded-compact' },

  // follow-pack variants
  { parent: 'follow-pack', variant: 'follow-pack-compact' },
  { parent: 'follow-pack', variant: 'follow-pack-hero' },
  { parent: 'follow-pack', variant: 'follow-pack-modern-portrait' },
  { parent: 'follow-pack', variant: 'follow-pack-portrait' },

  // hashtag-card variants
  { parent: 'hashtag-card', variant: 'hashtag-card-compact' },
  { parent: 'hashtag-card', variant: 'hashtag-card-portrait' },

  // highlight-card variants
  { parent: 'highlight-card', variant: 'highlight-card-compact' },

  // highlight-embedded variants
  { parent: 'highlight-embedded', variant: 'highlight-embedded-compact' },

  // image-card variants
  { parent: 'image-card', variant: 'image-card-hero' },

  // negentropy-sync variants
  { parent: 'negentropy-sync', variant: 'negentropy-sync-progress-compact' },

  // note-embedded variants
  { parent: 'note-embedded', variant: 'note-embedded-compact' },

  // relay-card variants
  { parent: 'relay-card', variant: 'relay-card-compact' },
  { parent: 'relay-card', variant: 'relay-card-portrait' },

  // user-card variants
  { parent: 'user-card', variant: 'user-card-classic' },
  { parent: 'user-card', variant: 'user-card-compact' },
  { parent: 'user-card', variant: 'user-card-landscape' },
  { parent: 'user-card', variant: 'user-card-neon' },
  { parent: 'user-card', variant: 'user-card-portrait' },

  // user-profile variants
  { parent: 'user-profile', variant: 'user-profile-hero' },

  // voice-message-card variants
  { parent: 'voice-message-card', variant: 'voice-message-card-compact' },
];

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function splitVariant(parent: string, variant: string) {
  const parentDir = join(COMPONENTS_DIR, parent);
  const variantFile = `${variant}.svelte`;
  const sourcePath = join(parentDir, variantFile);

  // Check if source exists
  if (!existsSync(sourcePath)) {
    console.log(`  ⚠️  Skipping ${variant} - file not found`);
    return;
  }

  // Create variant directory
  const variantDir = join(COMPONENTS_DIR, variant);
  if (!existsSync(variantDir)) {
    mkdirSync(variantDir, { recursive: true });
  }

  // Move the file
  const destPath = join(variantDir, variantFile);
  execSync(`mv "${sourcePath}" "${destPath}"`);

  // Create index.ts
  const exportName = toPascalCase(variant);
  const indexContent = `export { default as ${exportName} } from './${variantFile}';\n`;
  writeFileSync(join(variantDir, 'index.ts'), indexContent);

  // Update imports in the moved file
  let content = readFileSync(destPath, 'utf-8');

  // Fix relative imports - change ./ to ../{parent}/
  content = content.replace(
    new RegExp(`from '\\.\\/index\\.js'`, 'g'),
    `from '../${parent}/index.js'`
  );

  writeFileSync(destPath, content);

  console.log(`  ✓ Split ${variant}`);
}

function updateParentIndex(parent: string, variants: string[]) {
  const indexPath = join(COMPONENTS_DIR, parent, 'index.ts');

  if (!existsSync(indexPath)) {
    return;
  }

  let content = readFileSync(indexPath, 'utf-8');

  // Remove exports for variants that were moved
  for (const variant of variants) {
    const exportName = toPascalCase(variant);
    const variantFile = `${variant}.svelte`;

    // Remove export lines
    const patterns = [
      `export { default as ${exportName} } from './${variantFile}';`,
      `export { default as ${exportName} } from './${variantFile}'`,
    ];

    for (const pattern of patterns) {
      content = content.replace(new RegExp(pattern + '\n?', 'g'), '');
    }
  }

  writeFileSync(indexPath, content);
  console.log(`  ✓ Updated ${parent}/index.ts`);
}

function updateComponentsIndex() {
  const indexPath = join(COMPONENTS_DIR, 'index.ts');
  let content = readFileSync(indexPath, 'utf-8');

  // Group variants by parent
  const variantsByParent = new Map<string, string[]>();
  for (const { parent, variant } of VARIANTS_TO_SPLIT) {
    if (!variantsByParent.has(parent)) {
      variantsByParent.set(parent, []);
    }
    variantsByParent.get(parent)!.push(variant);
  }

  // Add exports for each variant after its parent
  for (const [parent, variants] of variantsByParent) {
    const parentExportLine = `export * from './${parent}';`;

    if (content.includes(parentExportLine)) {
      // Add variant exports after parent
      const variantExports = variants.map(v => `export * from './${v}';`).join('\n');
      content = content.replace(
        parentExportLine,
        `${parentExportLine}\n${variantExports}`
      );
    }
  }

  writeFileSync(indexPath, content);
  console.log(`  ✓ Updated components/index.ts`);
}

function updateBlocksIndex() {
  const blocksIndexPath = join(REGISTRY_DIR, 'blocks/index.ts');

  if (!existsSync(blocksIndexPath)) {
    return;
  }

  let content = readFileSync(blocksIndexPath, 'utf-8');

  // Update import paths for variants
  for (const { parent, variant } of VARIANTS_TO_SPLIT) {
    const exportName = toPascalCase(variant);
    const variantFile = `${variant}.svelte`;

    // Update the import path from parent to variant directory
    content = content.replace(
      new RegExp(`from '\\.\\./components/${parent}/${variantFile}'`, 'g'),
      `from '../components/${variant}/${variantFile}'`
    );
  }

  writeFileSync(blocksIndexPath, content);
  console.log(`  ✓ Updated blocks/index.ts`);
}

async function main() {
  console.log('🔧 Splitting variant components into standalone directories...\n');

  // Group by parent
  const byParent = new Map<string, string[]>();
  for (const { parent, variant } of VARIANTS_TO_SPLIT) {
    if (!byParent.has(parent)) {
      byParent.set(parent, []);
    }
    byParent.get(parent)!.push(variant);
  }

  // Process each parent
  for (const [parent, variants] of byParent) {
    console.log(`\n📦 Processing ${parent}:`);

    // Split variants
    for (const variant of variants) {
      splitVariant(parent, variant);
    }

    // Update parent index
    updateParentIndex(parent, variants);
  }

  // Update top-level indexes
  console.log('\n📝 Updating index files:');
  updateComponentsIndex();
  updateBlocksIndex();

  console.log('\n✅ All done!');
  console.log('\n💡 Next steps:');
  console.log('   1. Run: npx jsrepo build');
  console.log('   2. Test installing a variant component');
  console.log('   3. Review changes and commit\n');
}

main().catch(console.error);
