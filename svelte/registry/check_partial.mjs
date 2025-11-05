import registry from './registry.json' with { type: 'json' };
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const itemsToCheck = ['article-card', 'event-card', 'user-input', 'user-profile'];

itemsToCheck.forEach(itemName => {
  const item = registry.items.find(i => i.name === itemName);
  if (!item) {
    console.log('Item not found: ' + itemName);
    return;
  }
  
  console.log('\n=== ' + itemName + ' ===');
  console.log('Total files: ' + item.files.length);
  
  item.files.forEach(file => {
    let actualPath;
    if (file.path.startsWith('registry/ndk/components/')) {
      actualPath = file.path.replace(/^registry\/ndk\//, 'lib/registry/');
    } else if (file.path.startsWith('registry/ndk/ui/')) {
      actualPath = file.path.replace(/^registry\/ndk\//, 'lib/registry/');
    } else {
      actualPath = file.path.replace(/^registry\/ndk\//, 'lib/registry/components/');
    }
    const filePath = path.join(dirname, 'src', actualPath);
    
    const exists = fs.existsSync(filePath);
    console.log((exists ? '  ✓ ' : '  ✗ ') + file.path);
  });
});
