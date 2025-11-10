import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata: {
      title: 'Event Cards',
      oneLiner: 'Composable card components for displaying Nostr events'
    }
  };
};