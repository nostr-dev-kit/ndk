import metadata from '$lib/registry/components/article-content/metadata.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};