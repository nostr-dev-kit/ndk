import { json } from '@sveltejs/kit';
import registryData from '../../../registry.json';

export const prerender = true;

export function GET() {
  return json(registryData);
}
