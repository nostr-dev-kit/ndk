import { getReactionMetadata } from '$lib/registry-loader';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const metadata = await getReactionMetadata();

  return {
    reactionMetadata: metadata
  };
};