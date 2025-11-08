import metadata from '$lib/registry/components/zap/send/classic/registry.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};