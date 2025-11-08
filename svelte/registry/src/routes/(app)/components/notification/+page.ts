import metadata from '$lib/registry/components/notification/items/compact/registry.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};