import { json } from '@sveltejs/kit';
import registryData from '../../../registry.json';

export const prerender = true;

export function GET() {
  const index = registryData.items.map((item) => ({
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    registryDependencies: item.registryDependencies,
    relativeUrl: `${item.name}.json`,
  }));

  return json(index);
}
