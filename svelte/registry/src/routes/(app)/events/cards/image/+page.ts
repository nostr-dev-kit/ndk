import metadata from '$lib/registry/components/image-card/metadata.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};