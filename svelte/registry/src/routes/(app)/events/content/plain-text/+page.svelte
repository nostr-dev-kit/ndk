<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import Preview from '$site-components/preview.svelte';
  import { EditProps } from '$lib/site/components/edit-props';

  import BasicExample from './examples/basic.example.svelte';
  import CustomSnippetsExample from './examples/custom-snippets.example.svelte';

  // Import code for examples
  import basicCode from './examples/basic.example.svelte?raw';
  import customCode from './examples/custom-snippets.example.svelte?raw';

  const metadata = {
    title: 'Plain Text Content',
    description: 'Components for rendering plain text event content',
    apiDocs: []
  };

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

<!-- Composition examples -->
{#snippet anatomy()}
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Composition Examples</h2>
    <p class="text-muted-foreground mb-6">
      These examples show how to render plain text event content with different approaches.
      These are teaching examples, not installable components.
    </p>

    <div class="space-y-8">
      <div>
        <h3 class="text-xl font-semibold mb-3">Basic Rendering</h3>
        <p class="text-muted-foreground mb-4">Simple plain text rendering with automatic parsing of mentions, links, and hashtags.</p>
        <Preview code={basicCode}>
          <BasicExample {ndk} event={exampleEvent} />
        </Preview>
      </div>

      <div>
        <h3 class="text-xl font-semibold mb-3">Custom Snippets</h3>
        <p class="text-muted-foreground mb-4">Customize how mentions, links, and other elements are rendered using snippet overrides.</p>
        <Preview code={customCode}>
          <CustomSnippetsExample {ndk} event={exampleEvent} />
        </Preview>
      </div>
    </div>
  </section>
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  {anatomy}
>
  <EditProps.Prop name="Event content" type="text" bind:value={eventContent} />
</ComponentPageTemplate>
