import metadata from '$lib/registry/components/media/upload/button/registry.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};