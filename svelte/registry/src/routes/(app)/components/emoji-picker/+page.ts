import { getComponentMetadata } from '$lib/registry-loader';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const metadata = await getComponentMetadata('emoji-picker');

  return {
    metadata
  };
};