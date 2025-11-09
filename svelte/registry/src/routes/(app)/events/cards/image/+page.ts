import metadata from '$lib/registry/components/image/cards/basic/metadata.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};