import metadata from '$lib/registry/components/repost/buttons/basic/registry.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};