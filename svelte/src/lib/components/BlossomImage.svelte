<script lang="ts">
  import { useBlossomUrl } from '../blossom-url.svelte.js';
  import type { NDKBlossom } from '@nostr-dev-kit/ndk-blossom';
  import type { NDKUser } from '@nostr-dev-kit/ndk';

  interface Props {
    blossom: NDKBlossom;
    user: NDKUser;
    src: string;
    alt?: string;
    class?: string;
    width?: number;
    height?: number;
  }

  let {
    blossom,
    user,
    src,
    alt = '',
    class: className = '',
    width,
    height
  }: Props = $props();

  const blossomUrl = useBlossomUrl(blossom, user, src);

  const widthStyle = $derived(width ? `width: ${width}px;` : '');
  const heightStyle = $derived(height ? `height: ${height}px;` : '');
  const inlineStyle = $derived(`${widthStyle} ${heightStyle}`.trim());
</script>

<img
  src={blossomUrl.url}
  {alt}
  class="blossom-image {className}"
  class:healing={blossomUrl.status === 'healing'}
  class:error={blossomUrl.status === 'error'}
  style={inlineStyle || undefined}
  onerror={() => blossomUrl.onError()}
/>

<style>
  .blossom-image {
    display: block;
    transition: opacity 0.2s ease-in-out;
  }

  .blossom-image.healing {
    opacity: 0.5;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .blossom-image.error {
    opacity: 0.3;
    filter: grayscale(100%);
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.7;
    }
  }
</style>
