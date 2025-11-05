import registry from './registry.json' with { type: 'json' };
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const missing = [];

registry.items.forEach(item => {
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
      missing.push({
        item: item.name,
        registryPath: file.path,
        expectedPath: actualPath
      });
    }
  });
});

console.log('Missing files:');
missing.forEach(m => {
  console.log(`\n${m.item}: ${m.registryPath}`);
  console.log(`  -> src/${m.expectedPath}`);
});
console.log(`\nTotal missing: ${missing.length} files`);
