<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/components/ndk/edit-props';
	import Demo from '$site-components/Demo.svelte';

  import BasicExample from './examples/basic.svelte';
  import BasicExampleRaw from './examples/basic.svelte?raw';

  import CustomSnippetsExample from './examples/custom-snippets.svelte';
  import CustomSnippetsExampleRaw from './examples/custom-snippets.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let eventContent = $state<string>(`This is a rich content example! 🎉

It can handle:
- User mentions: nostr:npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft
- Hashtags: #nostr #bitcoin #decentralized
- Links: https://nostr.com
- Images: https://image.nostr.build/example.jpg
- Custom emojis: :custom_emoji:

Check out this event: nostr:nevent1qqsz6ycyexztrme2ls8wm4zfdg20alnas3pc595wdmklggws5uuka0qqy9c4n

Pretty cool, right? #awesome`);

  const exampleEvent = $derived(new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content: eventContent,
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['emoji', 'custom_emoji', 'https://example.com/emoji.png']
    ]
  } as any));
</script>

<div class="component-page">
  <header>
    <h1>Event Content</h1>
    <p>Rich event content renderer with automatic parsing of mentions, hashtags, links, media, and custom emojis.</p>

    <EditProps.Root>
      <EditProps.Prop name="Event content" type="text" bind:value={eventContent} />
    </EditProps.Root>
  </header>

  <section class="demo space-y-8">
    <h2 class="text-2xl font-semibold mb-4">Examples</h2>

    <Demo
      title="Basic Content Rendering"
      description="Automatically detects and renders mentions, hashtags, links, images, videos, YouTube embeds, and custom emojis."
      code={BasicExampleRaw}
    >
      <BasicExample {ndk} event={exampleEvent} />
    </Demo>

    <Demo
      title="Custom Snippets"
      description="Use custom snippets to override default rendering for any content type (mentions, hashtags, links, etc.)."
      code={CustomSnippetsExampleRaw}
    >
      <CustomSnippetsExample {ndk} event={exampleEvent} />
    </Demo>
  </section>
</div>
