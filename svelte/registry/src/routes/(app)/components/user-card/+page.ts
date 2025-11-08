import metadata from '$lib/registry/components/user/cards/classic/registry.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};