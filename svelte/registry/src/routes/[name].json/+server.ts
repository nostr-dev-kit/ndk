import { json, error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';
import registryData from '../../../registry.json';
import type { RequestHandler } from './$types';

export const prerender = true;

function transformItem(item: any) {
  const transformedItem = {
    ...item,
    files: item.files.map((file: any) => {
      // Read the actual file content
      // Convert registry/ndk/ path to lib/ndk/ for actual file location
      const actualPath = file.path.replace(/^registry\/ndk\//, 'lib/ndk/');
      const filePath = join(process.cwd(), 'src', actualPath);
      let content = '';

      try {
        content = readFileSync(filePath, 'utf-8');
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

export function GET({ params }: { params: { name: string } }): ReturnType<RequestHandler> {
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
