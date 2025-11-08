import metadata from '$lib/registry/components/misc/avatar-group/registry.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};