<script lang="ts">
  import { nip19 } from 'nostr-tools';
  import type NDK from '@nostr-dev-kit/ndk';
  import type { NDKUserProfile } from '@nostr-dev-kit/ndk';

  type AddressPointer = nip19.AddressPointer;
  type EventPointer = nip19.EventPointer;
  type ProfilePointer = nip19.ProfilePointer;

  interface Props {
    ndk: NDK;
    content?: string;
    class?: string;
    emojiTags?: string[][];
    onMentionClick?: (pubkey: string) => void;
    onEventClick?: (eventId: string) => void;
    onLinkClick?: (url: string) => void;
  }

  let {
    ndk,
    content = '',
    class: className = '',
    emojiTags = [],
    onMentionClick,
    onEventClick,
    onLinkClick,
  }: Props = $props();

  // Cache for fetched profiles
  let profileCache = $state<Map<string, NDKUserProfile | undefined>>(new Map());

  // Helper to get profile for a pubkey
  function getProfile(pubkey: string): NDKUserProfile | undefined {
    if (!profileCache.has(pubkey)) {
      const user = ndk.getUser({ pubkey });
      profileCache.set(pubkey, user.profile);

      if (!user.profile) {
        user.fetchProfile().then(() => {
          profileCache.set(pubkey, user.profile);
          profileCache = new Map(profileCache); // Trigger reactivity
        });
      }
    }
    return profileCache.get(pubkey);
  }

  interface ParsedSegment {
    type:
      | 'text'
      | 'npub'
      | 'nprofile'
      | 'note'
      | 'nevent'
      | 'naddr'
      | 'link'
      | 'media'
      | 'emoji'
      | 'image-grid';
    content: string;
    data?: string | ProfilePointer | EventPointer | AddressPointer | string[];
  }

  // ============================================================================
  // Pattern Definitions
  // ============================================================================

  const PATTERNS = {
    EMOJI_SHORTCODE: /:([a-zA-Z0-9_]+):/g,
    NOSTR_URI: /nostr:(npub1[a-z0-9]{58}|nprofile1[a-z0-9]+|note1[a-z0-9]{58}|nevent1[a-z0-9]+|naddr1[a-z0-9]+)/gi,
    MEDIA_FILE: /https?:\/\/[^\s<>"]+\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov)(\?[^\s<>"]*)?/gi,
    YOUTUBE: /https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})[^\s<>"]*/gi,
    URL: /https?:\/\/[^\s<>"]+/gi,
  } as const;

  // ============================================================================
  // Emoji Processing
  // ============================================================================

  function buildEmojiMap(tags: string[][]): Map<string, string> {
    const emojiMap = new Map();

    for (const [type, shortcode, url] of tags) {
      if (type === 'emoji' && shortcode && url) {
        emojiMap.set(shortcode, url);
      }
    }

    return emojiMap;
  }

  function createEmojiSegment(shortcode: string, emojiMap: Map<string, string>): ParsedSegment {
    const url = emojiMap.get(shortcode);
    return url
      ? { type: 'emoji', content: shortcode, data: url }
      : { type: 'text', content: `:${shortcode}:` };
  }

  // ============================================================================
  // Nostr URI Processing
  // ============================================================================

  function decodeNostrUri(uri: string): ParsedSegment {
    try {
      const prefix = uri.substring(0, uri.indexOf('1') + 1);
      const decoded = nip19.decode(uri);

      const typeMap: Record<string, ParsedSegment['type']> = {
        'npub1': 'npub',
        'nprofile1': 'nprofile',
        'note1': 'note',
        'nevent1': 'nevent',
        'naddr1': 'naddr'
      };

      const type = typeMap[prefix];
      if (type) {
        return { type, content: uri, data: decoded.data as string | ProfilePointer | EventPointer | AddressPointer };
      }
    } catch {
      console.warn('[EventContent] Failed to decode Nostr URI:', uri);
    }

    return { type: 'text', content: `nostr:${uri}` };
  }

  // ============================================================================
  // Media Detection
  // ============================================================================

  function isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
  }

  function isVideo(url: string): boolean {
    return /\.(mp4|webm|mov)(\?|$)/i.test(url);
  }

  function isYouTube(url: string): boolean {
    return /youtube\.com|youtu\.be/i.test(url);
  }

  function extractYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match?.[1] || null;
  }

  // ============================================================================
  // Segment Classification
  // ============================================================================

  function classifyMatch(text: string, emojiMap: Map<string, string>): ParsedSegment {
    // Check emoji shortcode
    if (text.startsWith(':') && text.endsWith(':')) {
      const shortcode = text.slice(1, -1);
      return createEmojiSegment(shortcode, emojiMap);
    }

    // Check Nostr URI
    if (text.startsWith('nostr:')) {
      return decodeNostrUri(text.slice(6));
    }

    // Check media
    if (isImage(text) || isVideo(text) || isYouTube(text)) {
      return { type: 'media', content: text };
    }

    // Check URL
    if (text.startsWith('http')) {
      return { type: 'link', content: text };
    }

    return { type: 'text', content: text };
  }

  // ============================================================================
  // Content Parsing
  // ============================================================================

  function collectMatches(content: string): Array<{ match: RegExpExecArray; index: number }> {
    const matches: Array<{ match: RegExpExecArray; index: number }> = [];

    for (const pattern of Object.values(PATTERNS)) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(content)) !== null) {
        matches.push({ match, index: match.index });
      }
    }

    return matches.sort((a, b) => a.index - b.index);
  }

  function parseContentToSegments(content: string, emojiMap: Map<string, string>): ParsedSegment[] {
    const segments: ParsedSegment[] = [];
    const matches = collectMatches(content);

    let lastIndex = 0;

    for (const { match, index } of matches) {
      // Skip overlapping matches
      if (index < lastIndex) continue;

      // Add text before match
      if (index > lastIndex) {
        segments.push({
          type: 'text',
          content: content.slice(lastIndex, index)
        });
      }

      // Add classified match
      segments.push(classifyMatch(match[0], emojiMap));
      lastIndex = index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      segments.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }

    return segments;
  }

  // ============================================================================
  // Image Grouping
  // ============================================================================

  function groupConsecutiveImages(segments: ParsedSegment[]): ParsedSegment[] {
    const result: ParsedSegment[] = [];
    let imageBuffer: string[] = [];

    function flushImages() {
      if (imageBuffer.length === 0) return;

      if (imageBuffer.length === 1) {
        result.push({ type: 'media', content: imageBuffer[0] });
      } else {
        result.push({
          type: 'image-grid',
          content: '',
          data: imageBuffer
        });
      }
      imageBuffer = [];
    }

    for (const segment of segments) {
      if (segment.type === 'media' && isImage(segment.content)) {
        imageBuffer.push(segment.content);
      } else {
        flushImages();
        result.push(segment);
      }
    }

    flushImages();
    return result;
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  function handleMentionClick(e: MouseEvent, pubkey: string) {
    if (onMentionClick) {
      e.preventDefault();
      e.stopPropagation();
      onMentionClick(pubkey);
    }
  }

  function handleEventClick(e: MouseEvent, eventId: string) {
    if (onEventClick) {
      e.preventDefault();
      e.stopPropagation();
      onEventClick(eventId);
    }
  }

  function handleLinkClick(e: MouseEvent, url: string) {
    if (onLinkClick) {
      e.preventDefault();
      e.stopPropagation();
      onLinkClick(url);
    }
  }

  // ============================================================================
  // Display Helpers
  // ============================================================================

  function getDisplayName(profile: NDKUserProfile | undefined, fallbackId: string): string {
    return profile?.name || profile?.displayName || `@${fallbackId.slice(0, 12)}...`;
  }

  // ============================================================================
  // Computed Values
  // ============================================================================

  const cleanedContent = $derived(content.replace(/\[Image #\d+\]/gi, '').trim());

  const segments = $derived(() => {
    const emojiMap = buildEmojiMap(emojiTags);
    const parsed = parseContentToSegments(cleanedContent, emojiMap);
    return groupConsecutiveImages(parsed);
  });
</script>

<div class="content-renderer {className}">
  {#each segments() as segment, index (index)}
    {#if segment.type === 'text'}
      <span class="whitespace-pre-wrap break-words">{segment.content}</span>
    {:else if segment.type === 'emoji'}
      <img
        src={segment.data as string}
        alt={`:${segment.content}:`}
        title={`:${segment.content}:`}
        class="custom-emoji"
        loading="lazy"
      />
    {:else if segment.type === 'npub'}
      {@const pubkey = segment.data as string}
      {@const profile = getProfile(pubkey)}
      <a
        href={`#/p/${segment.content}`}
        class="mention"
        onclick={(e) => handleMentionClick(e, pubkey)}
      >
        @{getDisplayName(profile, segment.content)}
      </a>
    {:else if segment.type === 'nprofile'}
      {@const pointer = segment.data as ProfilePointer}
      {@const profile = getProfile(pointer.pubkey)}
      {@const npub = nip19.npubEncode(pointer.pubkey)}
      <a
        href={`#/p/${npub}`}
        class="mention"
        onclick={(e) => handleMentionClick(e, pointer.pubkey)}
      >
        @{getDisplayName(profile, npub)}
      </a>
    {:else if segment.type === 'note'}
      <a
        href={`#/e/${segment.content}`}
        class="event-mention"
        onclick={(e) => handleEventClick(e, segment.data as string)}
      >
        [Note]
      </a>
    {:else if segment.type === 'nevent'}
      {@const pointer = segment.data as EventPointer}
      {@const noteId = nip19.noteEncode(pointer.id)}
      <a
        href={`#/e/${noteId}`}
        class="event-mention"
        onclick={(e) => handleEventClick(e, pointer.id)}
      >
        [Event]
      </a>
    {:else if segment.type === 'naddr'}
      <a
        href={`#/a/${segment.content}`}
        class="event-mention"
        onclick={(e) => handleEventClick(e, segment.content)}
      >
        [Article]
      </a>
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
              frameborder="0"
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
  }

  .mention:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  .event-mention {
    color: var(--accent-color, #8b5cf6);
    text-decoration: none;
    font-weight: 500;
    padding: 0.125rem 0.5rem;
    background: rgba(139, 92, 246, 0.1);
    border-radius: 0.25rem;
    transition: background 0.2s;
  }

  .event-mention:hover {
    background: rgba(139, 92, 246, 0.2);
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