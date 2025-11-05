import { json, error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';
import registryDataJson from '../../../registry.json';
import type { RequestHandler } from './$types';
import type { RegistryData, RegistryItem, RegistryFile, TransformedItem, TransformedFile } from './types';

export const prerender = true;

const registryData = registryDataJson as RegistryData;

// Build a map of all registry:ui file paths for smarter import transformation
function buildUiFileMap(): Set<string> {
  const uiFiles = new Set<string>();
  registryData.items.forEach((item) => {
    item.files.forEach((file) => {
      if (file.type === 'registry:ui') {
        // Store the path without registry/ndk/ prefix
        const path = file.path.replace(/^registry\/ndk\//, '');
        uiFiles.add(path);
      }
    });
  });
  return uiFiles;
}

const uiFileMap = buildUiFileMap();

function transformItem(item: RegistryItem): TransformedItem {
  const transformedItem: TransformedItem = {
    ...item,
    files: item.files.map((file): TransformedFile => {
      // Read the actual file content
      // Convert registry/ndk/ path to actual file location
      // If path starts with components/, use lib/registry/components/
      // If path starts with ui/, use lib/registry/ui/
      // Otherwise, default to lib/registry/components/
      let actualPath: string;
      if (file.path.startsWith('registry/ndk/components/')) {
        actualPath = file.path.replace(/^registry\/ndk\//, 'lib/registry/');
      } else if (file.path.startsWith('registry/ndk/ui/')) {
        actualPath = file.path.replace(/^registry\/ndk\//, 'lib/registry/');
      } else {
        // For paths without components/ or ui/, assume components/
        actualPath = file.path.replace(/^registry\/ndk\//, 'lib/registry/components/');
      }
      const filePath = join(process.cwd(), 'src', actualPath);
      let content = '';

      try {
        content = readFileSync(filePath, 'utf-8');

        // Transform import paths: replace $lib/registry/components/ with correct relative path
        // For registry:ui files, they get installed to ui/ subdirectory by shadcn-svelte
        content = content.replace(/\$lib\/registry\/components\/([^\s'"]+)/g, (match, importPath) => {
          // Check if the import target is a registry:ui file
          if (uiFileMap.has(importPath)) {
            // Add ui/ prefix for registry:ui files
            return `../ui/${importPath}`;
          }
          // For non-ui files, use standard relative path
          return `../${importPath}`;
        });
      } catch (err) {
        console.error(`Failed to read file: ${filePath}`, err);
      }

      // Convert path to target (remove 'registry/ndk/' prefix)
      const target = file.path.replace(/^registry\/ndk\//, '');

      return {
        content,
        type: file.type === 'registry:component' ? 'registry:file' : file.type,
        target,
      };
    }),
  };

  return transformedItem;
}

export const GET: RequestHandler = ({ params }) => {
  const item = registryData.items.find((item) => item.name === params.name);

  if (!item) {
    throw error(404, `Component "${params.name}" not found`);
  }

  const transformedItem = transformItem(item);
  return json(transformedItem);
}

export function entries() {
  return registryData.items.map((item) => ({
    name: item.name,
  }));
}
