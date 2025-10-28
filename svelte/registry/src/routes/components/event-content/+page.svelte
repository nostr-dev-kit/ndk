<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import CodePreview from '$lib/components/code-preview.svelte';

  import BasicExample from '$lib/ndk/event-content/examples/basic.svelte';
  import BasicExampleRaw from '$lib/ndk/event-content/examples/basic.svelte?raw';

  import WithEmojisExample from '$lib/ndk/event-content/examples/with-emojis.svelte';
  import WithEmojisExampleRaw from '$lib/ndk/event-content/examples/with-emojis.svelte?raw';

  import WithMediaExample from '$lib/ndk/event-content/examples/with-media.svelte';
  import WithMediaExampleRaw from '$lib/ndk/event-content/examples/with-media.svelte?raw';

  import CustomSnippetsExample from '$lib/ndk/event-content/examples/custom-snippets.svelte';
  import CustomSnippetsExampleRaw from '$lib/ndk/event-content/examples/custom-snippets.svelte?raw';

  import CustomLinksExample from '$lib/ndk/event-content/examples/custom-links.svelte';
  import CustomLinksExampleRaw from '$lib/ndk/event-content/examples/custom-links.svelte?raw';

  import PlainTextExample from '$lib/ndk/event-content/examples/plain-text.svelte';
  import PlainTextExampleRaw from '$lib/ndk/event-content/examples/plain-text.svelte?raw';

  import TruncatedExample from '$lib/ndk/event-content/examples/truncated.svelte';
  import TruncatedExampleRaw from '$lib/ndk/event-content/examples/truncated.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

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

  const longEvent = new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content: `This is a longer piece of content that demonstrates the truncation feature! 🎉

When you use the truncate prop on EventCard.Content, it will limit the visible content to a specific number of lines using CSS line-clamp. If the content exceeds that height, a "Read more" button appears automatically.

This is particularly useful in feed views where you want to show a preview of long posts without taking up too much vertical space. Users can click "Read more" to expand the full content, and then click "Show less" to collapse it again.

The truncation is done using vertical space (lines) rather than character count, which provides a much better user experience. It works great with all types of content including mentions, hashtags, links, and media!

Pretty cool feature, right? #nostr #ux #design`,
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000),
    tags: []
  } as any);
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
      code={BasicExampleRaw}
    >
      <BasicExample {ndk} event={exampleEvent} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Custom Emoji Support"
      description="Custom emojis from event tags are automatically rendered."
      code={WithEmojisExampleRaw}
    >
      <WithEmojisExample {ndk} event={emojiEvent} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Media Embedding"
      description="Images, videos, and YouTube links are automatically embedded."
      code={WithMediaExampleRaw}
    >
      <WithMediaExample {ndk} event={mediaEvent} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Custom Snippets"
      description="Use custom snippets to override default rendering for any content type."
      code={CustomSnippetsExampleRaw}
    >
      <CustomSnippetsExample {ndk} event={exampleEvent} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Custom Link Rendering"
      description="Override link rendering with your own component."
      code={CustomLinksExampleRaw}
    >
      <CustomLinksExample {ndk} event={exampleEvent} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Plain Text Content"
      description="Works with plain text content without an event object."
      code={PlainTextExampleRaw}
    >
      <PlainTextExample {ndk} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Truncated Content with Read More"
      description="Limit content to a specific number of lines with automatic 'Read more' button. Uses EventCard.Content with the truncate prop."
      code={TruncatedExampleRaw}
    >
      <TruncatedExample {ndk} event={longEvent} />
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
</style>
