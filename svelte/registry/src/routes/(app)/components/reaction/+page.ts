import metadata from '$lib/registry/components/reaction/buttons/longpress/registry.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};