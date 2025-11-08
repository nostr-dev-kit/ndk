import metadata from '$lib/registry/components/follow/packs/basic/registry.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};