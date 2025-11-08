import metadata from '$lib/registry/components/zap/buttons/basic/registry.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};