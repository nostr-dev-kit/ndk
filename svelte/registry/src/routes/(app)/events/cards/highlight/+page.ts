import metadata from '$lib/registry/components/highlight/cards/basic/metadata.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};