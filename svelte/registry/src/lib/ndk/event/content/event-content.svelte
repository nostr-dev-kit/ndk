<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createEventContent, type ParsedSegment } from '@nostr-dev-kit/svelte';
  import Mention from './mention/mention.svelte';
  import Hashtag from './hashtag/hashtag.svelte';
  import EmbeddedEvent from './event/event.svelte';

  interface EventContentProps {
    ndk: NDKSvelte;
    event?: NDKEvent;
    content?: string;
    emojiTags?: string[][];
    class?: string;
    mention?: Snippet<[{ bech32: string }]>;
    eventRef?: Snippet<[{ bech32: string }]>;
    hashtag?: Snippet<[{ tag: string }]>;
    link?: Snippet<[{ url: string }]>;
    media?: Snippet<[{ url: string }]>;
    emoji?: Snippet<[{ shortcode: string; url: string }]>;
    imageGrid?: Snippet<[{ urls: string[] }]>;
  }

  let {
    ndk,
    event,
    content: contentProp,
    emojiTags,
    class: className = '',
    mention,
    eventRef,
    hashtag,
    link,
    media,
    emoji,
    imageGrid,
  }: EventContentProps = $props();

  const parsed = createEventContent({
    ndk,
    event: () => event,
    content: () => contentProp,
    emojiTags: () => emojiTags
  });
</script>

<div class="event-content {className}">
  {#each parsed.segments as segment, i (i)}
    {#if segment.type === 'text'}
      {segment.content}
    {:else if segment.type === 'npub' || segment.type === 'nprofile'}
      {#if mention}
        {@render mention({ bech32: segment.data as string })}
      {:else}
        <Mention {ndk} bech32={segment.data as string} />
      {/if}
    {:else if segment.type === 'event-ref'}
      {#if eventRef}
        {@render eventRef({ bech32: segment.data as string })}
      {:else}
        <EmbeddedEvent {ndk} bech32={segment.data as string} />
      {/if}
    {:else if segment.type === 'hashtag'}
      {#if hashtag}
        {@render hashtag({ tag: segment.data as string })}
      {:else}
        <Hashtag tag={segment.data as string} />
      {/if}
    {:else if segment.type === 'link'}
      {#if link}
        {@render link({ url: segment.content })}
      {:else}
        <!-- svelte-ignore a11y_invalid_attribute -->
        <a href={segment.content} target="_blank" rel="noopener noreferrer" class="link">
          {segment.content}
        </a>
      {/if}
    {:else if segment.type === 'media'}
      {#if media}
        {@render media({ url: segment.content })}
      {:else}
        {#if segment.content.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)}
          <img src={segment.content} alt="" class="media-image" />
        {:else if segment.content.match(/\.(mp4|webm|mov)(\?|$)/i)}
          <!-- svelte-ignore a11y_media_has_caption -->
          <video src={segment.content} controls class="media-video"></video>
        {:else if segment.content.match(/youtube\.com|youtu\.be/i)}
          {@const videoId = segment.content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)?.[1]}
          {#if videoId}
            <iframe
              src="https://www.youtube.com/embed/{videoId}"
              title="YouTube video"
              class="media-youtube"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          {/if}
        {/if}
      {/if}
    {:else if segment.type === 'emoji'}
      {#if emoji}
        {@render emoji({ shortcode: segment.content, url: segment.data as string })}
      {:else}
        <img src={segment.data} alt=":{segment.content}:" class="custom-emoji" />
      {/if}
    {:else if segment.type === 'image-grid'}
      {#if imageGrid}
        {@render imageGrid({ urls: segment.data as string[] })}
      {:else}
        <div class="image-grid">
          {#each segment.data as url, j (j)}
            <img src={url} alt="" class="grid-image" />
          {/each}
        </div>
      {/if}
    {/if}
  {/each}
</div>

<style>
  .event-content {
    white-space: pre-wrap;
    word-break: break-word;
    line-height: 1.6;
  }

  .mention,
  .event-ref {
    color: #8b5cf6;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
  }

  .mention:hover,
  .event-ref:hover {
    text-decoration: underline;
  }

  .hashtag {
    color: #2563eb;
    cursor: pointer;
  }

  .hashtag:hover {
    text-decoration: underline;
  }

  .link {
    color: #2563eb;
    text-decoration: underline;
    word-break: break-all;
  }

  .link:hover {
    color: #1d4ed8;
  }

  .media-image {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 0.5rem 0;
  }

  .media-video {
    max-width: 100%;
    border-radius: 0.5rem;
    margin: 0.5rem 0;
  }

  .media-youtube {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 0.5rem;
    margin: 0.5rem 0;
  }

  .custom-emoji {
    display: inline-block;
    width: 1.25em;
    height: 1.25em;
    vertical-align: middle;
    margin: 0 0.1em;
  }

  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.5rem;
    margin: 0.5rem 0;
  }

  .grid-image {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 0.5rem;
    aspect-ratio: 1;
  }
</style>
