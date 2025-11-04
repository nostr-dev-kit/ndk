#!/usr/bin/env node
/**
 * Script to fix common Svelte issues identified by svelte-check
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Track fixes
const fixes = {
  selfClosingTags: 0,
  total: 0,
  filesFixed: []
};

// Fix self-closing tags for non-void elements
function fixSelfClosingTags(content) {
  let modified = false;

  // Match self-closing non-void HTML tags
  // Pattern: <tagname ...props /> where tagname is not a void element
  const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

  const pattern = /<(div|span|button|a|p|h1|h2|h3|h4|h5|h6|section|article|nav|header|footer|main|aside|ul|ol|li|form|label|select|textarea|option|table|tr|td|th|thead|tbody|tfoot|caption|figure|figcaption|video|audio|canvas|svg|path|circle|rect|ellipse|line|polyline|polygon|g|defs|clipPath|mask|pattern|marker|symbol|text|tspan)(\s[^>]*)?\s*\/>/g;

  const newContent = content.replace(pattern, (match, tagName, attrs) => {
    modified = true;
    fixes.selfClosingTags++;
    const attributes = attrs || '';
    return `<${tagName}${attributes}></${tagName}>`;
  });

  return { content: newContent, modified };
}

// Process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    let newContent = content;
    let fileModified = false;

    // Apply fixes
    const selfClosingResult = fixSelfClosingTags(newContent);
    if (selfClosingResult.modified) {
      newContent = selfClosingResult.content;
      fileModified = true;
    }

    // Save if modified
    if (fileModified) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      fixes.filesFixed.push(filePath);
      fixes.total++;

      // Git commit
      const relativePath = path.relative(process.cwd(), filePath);
      const fileName = path.basename(filePath);
      try {
        execSync(`git add "${relativePath}"`, { stdio: 'pipe' });
        execSync(`git commit -m "fix(svelte): ${fileName} - remove self-closing non-void element tags"`, { stdio: 'pipe' });
        console.log(`✓ Fixed and committed: ${fileName}`);
      } catch (e) {
        console.error(`✗ Failed to commit ${fileName}:`, e.message);
      }
    }

    return fileModified;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Find all Svelte files
function findSvelteFiles(dir) {
  const files = [];

  function traverse(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      // Skip node_modules
      if (entry.name === 'node_modules' || entry.name === '.git') {
        continue;
      }

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.svelte')) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

// Main execution
function main() {
  const srcDir = path.join(process.cwd(), 'src');

  console.log('Finding Svelte files...');
  const svelteFiles = findSvelteFiles(srcDir);
  console.log(`Found ${svelteFiles.length} Svelte files\n`);

  console.log('Processing files...\n');
  svelteFiles.forEach(processFile);

  console.log('\n=== Fix Summary ===');
  console.log(`Self-closing tags fixed: ${fixes.selfClosingTags}`);
  console.log(`Total files modified: ${fixes.total}`);
  console.log(`Files fixed: ${fixes.filesFixed.length}`);
}

main();
