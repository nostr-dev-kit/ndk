import { json, error } from '@sveltejs/kit';
import registryData from '../../../registry.json';
import type { RequestHandler } from './$types';

export const prerender = true;

export function GET({ params }: { params: { name: string } }): ReturnType<RequestHandler> {
  const item = registryData.items.find((item) => item.name === params.name);

  if (!item) {
    throw error(404, `Component "${params.name}" not found`);
  }

  return json(item);
}

export function entries() {
  return registryData.items.map((item) => ({
    name: item.name,
  }));
}
