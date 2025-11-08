import metadata from '$lib/registry/components/image/cards/basic/registry.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};