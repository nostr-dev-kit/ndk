import metadata from '$lib/registry/components/misc/content-tab/registry.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};