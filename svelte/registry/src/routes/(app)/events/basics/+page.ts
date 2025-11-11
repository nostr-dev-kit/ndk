import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    metadata: {
      title: 'Getting Started with Content Rendering',
      oneLiner: 'Configure the content renderer in your app layout to enable rich content display'
    }
  };
};
