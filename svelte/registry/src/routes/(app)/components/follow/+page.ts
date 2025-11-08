import metadata from '$lib/registry/components/follow/buttons/basic/registry.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};