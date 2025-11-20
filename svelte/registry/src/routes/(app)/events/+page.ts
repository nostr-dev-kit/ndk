import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata: {
      title: 'Event Rendering Architecture',
      oneLiner: 'Understanding the three composable layers for rendering Nostr events'
    }
  };
};