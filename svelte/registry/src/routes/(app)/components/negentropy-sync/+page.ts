import metadata from '$lib/registry/components/negentropy-sync/progress/animated/registry.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};