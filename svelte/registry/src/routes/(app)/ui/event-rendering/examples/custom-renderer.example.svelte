<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import EventContent from '$lib/registry/ui/event-content.svelte'; import { ContentRenderer } from '$lib/registry/ui/content-renderer.svelte.js';
  import CustomHashtag from './hashtag-custom.example.svelte';
  import CustomLink from './link-custom.example.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // Create custom renderer
  const customRenderer = new ContentRenderer();
  customRenderer.hashtagComponent = CustomHashtag;
  customRenderer.linkComponent = CustomLink;

  const sampleContent = "Check out https://nostr.com for more info! #nostr #web3";
</script>

<EventContent {ndk} content={sampleContent} renderer={customRenderer} />
