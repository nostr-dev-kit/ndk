import metadata from '$lib/registry/components/voice-message/cards/compact/registry.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata
  };
};