<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import EventContent from '$lib/ndk/event/content/event-content.svelte';
  import Mention from '$lib/ndk/event/content/mention/mention.svelte';
  import Hashtag from '$lib/ndk/event/content/hashtag/hashtag.svelte';
  import EmbeddedEvent from '$lib/ndk/event/content/event/event.svelte';
  import CodePreview from '$lib/components/code-preview.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // Example event with various content types
  const exampleEvent = new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content: `This is a rich content example! 🎉

It can handle:
- User mentions: nostr:npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft
- Hashtags: #nostr #bitcoin #decentralized
- Links: https://nostr.com
- Images: https://image.nostr.build/example.jpg
- Custom emojis: :custom_emoji:

Check out this event: nostr:nevent1qqsz6ycyexztrme2ls8wm4zfdg20alnas3pc595wdmklggws5uuka0qqy9c4n

Pretty cool, right? #awesome`,
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['emoji', 'custom_emoji', 'https://example.com/emoji.png']
    ]
  } as any);

  // Event with custom emoji
  const emojiEvent = new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content: 'Here are some custom emojis: :fire: :rocket: :heart:',
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['emoji', 'fire', 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f525.svg'],
      ['emoji', 'rocket', 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f680.svg'],
      ['emoji', 'heart', 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/2764.svg']
    ]
  } as any);

  // Event with media
  const mediaEvent = new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content: `Check out this image:
https://picsum.photos/600/400

And this video:
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4

YouTube embed:
https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000),
    tags: []
  } as any);

  function handleHashtagClick(tag: string) {
    console.log('Hashtag clicked:', tag);
  }
</script>

<div class="component-page">
  <header>
    <h1>Event Content</h1>
    <p>Rich event content renderer with automatic parsing of mentions, hashtags, media, and more.</p>
  </header>

  <section class="demo">
    <CodePreview
      title="Basic Content Rendering"
      description="Automatically detects and renders mentions, hashtags, links, and custom emojis."
      code={`<EventContent {ndk} {event} />`}
    >
      <EventContent {ndk} event={exampleEvent} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Custom Emoji Support"
      description="Custom emojis from event tags are automatically rendered."
      code={`<EventContent {ndk} {event} />`}
    >
      <EventContent {ndk} event={emojiEvent} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Media Embedding"
      description="Images, videos, and YouTube links are automatically embedded."
      code={`<EventContent {ndk} {event} />`}
    >
      <EventContent {ndk} event={mediaEvent} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Custom Snippets"
      description="Use custom snippets to override default rendering for any content type."
      code={`<EventContent {ndk} {event}>
  {#snippet mention({ bech32 })}
    <Mention {ndk} {bech32} />
  {/snippet}
  {#snippet hashtag({ tag })}
    <Hashtag {tag} onclick={handleHashtagClick} />
  {/snippet}
  {#snippet eventRef({ bech32 })}
    <EmbeddedEvent {ndk} {bech32} />
  {/snippet}
</EventContent>`}
    >
      <EventContent {ndk} event={exampleEvent}>
        {#snippet mention({ bech32 })}
          <Mention {ndk} {bech32} />
        {/snippet}
        {#snippet hashtag({ tag })}
          <Hashtag {tag} onclick={handleHashtagClick} />
        {/snippet}
        {#snippet eventRef({ bech32 })}
          <EmbeddedEvent {ndk} {bech32} />
        {/snippet}
      </EventContent>
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Custom Link Rendering"
      description="Override link rendering with your own component."
      code={`<EventContent {ndk} {event}>
  {#snippet link({ url })}
    <a href={url} target="_blank" rel="noopener noreferrer" class="custom-link">
      🔗 {url}
    </a>
  {/snippet}
</EventContent>`}
    >
      <EventContent {ndk} event={exampleEvent}>
        {#snippet link({ url })}
          <a href={url} target="_blank" rel="noopener noreferrer" class="custom-link">
            🔗 {url}
          </a>
        {/snippet}
      </EventContent>
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Plain Text Content"
      description="Works with plain text content without an event object."
      code={`<EventContent
  {ndk}
  content="Simple text with #hashtags and links: https://example.com"
/>`}
    >
      <EventContent
        {ndk}
        content="Simple text with #hashtags and links: https://example.com"
      />
    </CodePreview>
  </section>
</div>

<style>
  .component-page {
    max-width: 900px;
  }

  .component-page > header {
    margin-bottom: 2rem;
  }

  .component-page > header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
    color: #111827;
  }

  .component-page > header p {
    font-size: 1.125rem;
    color: #6b7280;
    margin: 0;
  }

  .component-page > section {
    margin-bottom: 3rem;
  }

  .demo {
    padding: 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
  }

  :global(.custom-link) {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: #7c3aed;
    text-decoration: none;
    font-weight: 500;
  }

  :global(.custom-link:hover) {
    text-decoration: underline;
  }
</style>
