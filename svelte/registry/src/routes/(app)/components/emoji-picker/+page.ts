import metadata from '$lib/registry/components/misc/emoji-picker/registry.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};