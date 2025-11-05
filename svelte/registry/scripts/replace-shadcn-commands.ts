#!/usr/bin/env bun
/**
 * Replace all npx shadcn@latest add commands with jsrepo add commands
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Get all files that contain shadcn commands
const filesOutput = execSync(
  `grep -r "npx shadcn@latest add" --files-with-matches src/ MIGRATION_GUIDE.md 2>/dev/null || true`,
  { encoding: 'utf-8' }
);

const files = filesOutput
  .split('\n')
  .filter(f => f.trim().length > 0);

let totalReplacements = 0;

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  const originalContent = content;

  // Replace npx shadcn@latest add with npx jsrepo add
  content = content.replace(
    /npx shadcn@latest add/g,
    'npx jsrepo add'
  );

  if (content !== originalContent) {
    writeFileSync(file, content);
    const count = (originalContent.match(/npx shadcn@latest add/g) || []).length;
    totalReplacements += count;
    console.log(`✓ ${file} (${count} replacements)`);
  }
}

console.log(`\n✅ Replaced ${totalReplacements} occurrences in ${files.length} files`);
