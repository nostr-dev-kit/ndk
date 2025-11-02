<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventContent, ContentRenderer } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');

  // Custom hashtag component
  const CustomHashtag = (props: { tag: string }) => {
    return `<span class="custom-hashtag">#${props.tag}</span>`;
  };

  // Custom link component
  const CustomLink = (props: { url: string }) => {
    return `<a href="${props.url}" class="custom-link" target="_blank" rel="noopener noreferrer">${props.url}</a>`;
  };

  // Create custom renderer
  const customRenderer = new ContentRenderer();
  customRenderer.setHashtagComponent(CustomHashtag);
  customRenderer.setLinkComponent(CustomLink);

  const sampleContent = "Check out https://nostr.com for more info! #nostr #web3";
</script>

<div class="custom-renderer-demo">
  <EventContent {ndk} content={sampleContent} renderer={customRenderer} />
</div>

<style>
  .custom-renderer-demo {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    background: white;
  }

  .custom-renderer-demo :global(.custom-hashtag) {
    color: #8b5cf6;
    font-weight: 600;
  }

  .custom-renderer-demo :global(.custom-link) {
    color: #3b82f6;
    text-decoration: underline;
  }
</style>
