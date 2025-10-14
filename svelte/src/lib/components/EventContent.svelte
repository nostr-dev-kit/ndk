<!--
  @component EventContent - Renders Nostr event content with rich parsing and entity detection

  Automatically detects and renders:
  - User mentions (npub, nprofile) with avatars
  - Event references (note, nevent, naddr)
  - Media (images, videos, YouTube embeds)
  - Custom emojis
  - Links

  Usage: See documentation for EventContentHandlersProxy for setting up global handlers.
-->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '$lib/ndk-svelte.svelte.js';
  import {
    type EventContentComponents,
    mergeComponentRegistries
  } from './event-content-components.js';
  import {
    type EventContentHandlers,
    mergeHandlerRegistries
  } from './event-content-handlers.js';
  import {
    buildEmojiMap,
    parseContentToSegments,
    groupConsecutiveImages,
    isImage,
    isVideo,
    isYouTube,
    extractYouTubeId,
    type ParsedSegment
  } from './event-content-utils.js';

  interface Props {
    /** NDKSvelte instance for fetching profiles and user data */
    ndk: NDKSvelte;
    /** NDKEvent to render. If provided, content and emojiTags will be extracted from it. */
    event?: NDKEvent;
    /** The content to render (ignored if event is provided) */
    content?: string;
    /** Additional CSS classes to apply to the container */
    class?: string;
    /** Emoji tags from the event (ignored if event is provided) */
    emojiTags?: string[][];
    /** Custom components to use for rendering different segment types */
    components?: Partial<EventContentComponents>;
    /** Custom handlers for content interactions. Overrides global handlers set via EventContent.handlers */
    handlers?: Partial<EventContentHandlers>;
  }

  let {
    ndk,
    event,
    content = '',
    class: className = '',
    emojiTags = [],
    components = {},
    handlers: propsHandlers = {},
  }: Props = $props();

  // Extract content and emoji tags from event if provided
  const actualContent = $derived(event?.content ?? content);
  const actualEmojiTags = $derived(event ? event.tags.filter(t => t[0] === 'emoji') : emojiTags);

  // Merge component registries: defaults < global < props
  const finalComponents = $derived(mergeComponentRegistries(components));

  // Merge handlers: global < props.handlers
  const finalHandlers = $derived(mergeHandlerRegistries(propsHandlers));

  // ============================================================================
  // Event Handlers
  // ============================================================================

  function handleLinkClick(e: MouseEvent, url: string) {
    if (finalHandlers.onLinkClick) {
      e.preventDefault();
      e.stopPropagation();
      finalHandlers.onLinkClick(url);
    }
  }

  // ============================================================================
  // Computed Values
  // ============================================================================

  const cleanedContent = $derived(actualContent.replace(/\[Image #\d+\]/gi, '').trim());
  const emojiMap = $derived(buildEmojiMap(actualEmojiTags));
  const parsedSegments = $derived(parseContentToSegments(cleanedContent, emojiMap));
  const segments = $derived(groupConsecutiveImages(parsedSegments));
</script>

<div class="content-renderer {className}">
  {#each segments as segment, index (index)}
    {#if segment.type === 'text'}
      <span class="whitespace-pre-wrap break-words">{segment.content.trim()}</span>
    {:else if segment.type === 'emoji'}
      <img
        src={segment.data as string}
        alt={`:${segment.content}:`}
        title={`:${segment.content}:`}
        class="custom-emoji"
        loading="lazy"
      />
    {:else if segment.type === 'hashtag'}
      {@const HashtagComponent = finalComponents.hashtag}
      <HashtagComponent
        hashtag={segment.content}
        onClick={finalHandlers.onHashtagClick}
      />
    {:else if segment.type === 'npub' || segment.type === 'nprofile'}
      {@const bech32 = segment.data as string}
      {@const MentionComponent = finalComponents.mention}
      <MentionComponent
        {ndk}
        {bech32}
        onClick={finalHandlers.onMentionClick}
      />
    {:else if segment.type === 'event-ref'}
      {@const bech32 = segment.data as string}
      {@const EmbeddedEventComponent = finalComponents.embeddedEvent}
      <EmbeddedEventComponent
        {ndk}
        {bech32}
        onEventClick={finalHandlers.onEventClick}
      />
    {:else if segment.type === 'link'}
      <a
        href={segment.content}
        target="_blank"
        rel="noopener noreferrer"
        class="link"
        onclick={(e) => handleLinkClick(e, segment.content)}
      >
        {segment.content}
      </a>
    {:else if segment.type === 'image-grid'}
      {@const images = segment.data as string[]}
      <div class="image-grid grid-{Math.min(images.length, 3)}">
        {#each images as imageUrl (imageUrl)}
          <img src={imageUrl} alt="" loading="lazy" class="grid-image" />
        {/each}
      </div>
    {:else if segment.type === 'media'}
      {@const url = segment.content}
      <div class="media-embed">
        {#if isYouTube(url)}
          {@const videoId = extractYouTubeId(url)}
          {#if videoId}
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              class="youtube-embed"
            ></iframe>
          {/if}
        {:else if isVideo(url)}
          <video src={url} controls class="video-embed">
            <track kind="captions" />
          </video>
        {:else}
          <img src={url} alt="" loading="lazy" class="image-embed" />
        {/if}
      </div>
    {/if}
  {/each}
</div>

<style>
  .content-renderer {
    line-height: 1.6;
  }

  .whitespace-pre-wrap {
    white-space: pre-wrap;
  }

  .break-words {
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .mention {
    color: var(--accent-color, #8b5cf6);
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    vertical-align: middle;
  }

  .mention:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  .mention :global(.mention-avatar) {
    flex-shrink: 0;
  }

  .link {
    color: var(--link-color, #3b82f6);
    text-decoration: none;
    word-break: break-all;
    transition: opacity 0.2s;
  }

  .link:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  .media-embed {
    margin: 1rem 0;
    max-width: 100%;
  }

  .image-embed,
  .video-embed {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    display: block;
  }

  .youtube-embed {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 0.5rem;
  }

  .image-grid {
    display: grid;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .grid-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid-3 {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .grid-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0.5rem;
    aspect-ratio: 1;
  }

  .custom-emoji {
    display: inline-block;
    width: 1.25rem;
    height: 1.25rem;
    vertical-align: middle;
    margin: 0 0.125rem;
  }
</style>