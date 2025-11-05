import registry from './registry.json' with { type: 'json' };
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brokenItems = new Map();

registry.items.forEach(item => {
  const missingFiles = [];
  
  item.files.forEach(file => {
    let actualPath;
    if (file.path.startsWith('registry/ndk/components/')) {
      actualPath = file.path.replace(/^registry\/ndk\//, 'lib/registry/');
    } else if (file.path.startsWith('registry/ndk/ui/')) {
      actualPath = file.path.replace(/^registry\/ndk\//, 'lib/registry/');
    } else {
      actualPath = file.path.replace(/^registry\/ndk\//, 'lib/registry/components/');
    }
    const filePath = path.join(__dirname, 'src', actualPath);
    
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file.path);
    }
  });
  
  if (missingFiles.length > 0) {
    brokenItems.set(item.name, {
      totalFiles: item.files.length,
      missingFiles: missingFiles.length,
      allMissing: missingFiles.length === item.files.length,
      missing: missingFiles
    });
  }
});

console.log('=== Registry Items with Missing Files ===\n');
console.log('Items where ALL files are missing (should be removed):');
const toRemove = [];
brokenItems.forEach((info, name) => {
  if (info.allMissing) {
    console.log(`  - ${name} (${info.totalFiles} files missing)`);
    toRemove.push(name);
  }
});

console.log('\nItems where SOME files are missing (needs manual review):');
const toReview = [];
brokenItems.forEach((info, name) => {
  if (!info.allMissing) {
    console.log(`  - ${name} (${info.missingFiles}/${info.totalFiles} files missing)`);
    toReview.push(name);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total broken items: ${brokenItems.size}`);
console.log(`To remove (all files missing): ${toRemove.length}`);
console.log(`To review (partial files): ${toReview.length}`);

// Output list for removal
console.log('\n=== Items to Remove ===');
console.log(JSON.stringify(toRemove, null, 2));
