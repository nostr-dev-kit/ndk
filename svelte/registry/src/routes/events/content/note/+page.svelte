<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { contentNoteMetadata, contentNoteBasicCard, contentNoteCustomSnippetsCard } from '$lib/component-registry/content-note';
  import { EditProps } from '$lib/site-components/edit-props';
  import type { ShowcaseBlock } from '$lib/templates/types';

  import BasicExample from './examples/basic.example.svelte';
  import CustomSnippetsExample from './examples/custom-snippets.example.svelte';

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

  const showcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Basic Rendering',
      description: 'Auto-detects content',
      command: 'npx jsrepo add event-content',
      preview: basicPreview,
      cardData: contentNoteBasicCard
    },
    {
      name: 'Custom Snippets',
      description: 'Override rendering',
      command: 'npx jsrepo add event-content',
      preview: customSnippetsPreview,
      cardData: contentNoteCustomSnippetsCard
    }
  ];
</script>

<!-- EditProps snippet -->
<!-- Preview snippets for showcase -->
{#snippet basicPreview()}
  <BasicExample {ndk} event={exampleEvent} />
{/snippet}

{#snippet customSnippetsPreview()}
  <CustomSnippetsExample {ndk} event={exampleEvent} />
{/snippet}

<!-- Preview snippets for components section -->
{#snippet basicComponentPreview()}
  <BasicExample {ndk} event={exampleEvent} />
{/snippet}

{#snippet customSnippetsComponentPreview()}
  <CustomSnippetsExample {ndk} event={exampleEvent} />
{/snippet}

<!-- Use the template -->
{#if true}
  <ComponentPageTemplate
  metadata={contentNoteMetadata}
  {ndk}
  {showcaseBlocks}componentsSection={{
    cards: contentNoteMetadata.cards,
    previews: {
      'event-content-basic': basicComponentPreview,
      'event-content-custom-snippets': customSnippetsComponentPreview
    }
  }}
  apiDocs={contentNoteMetadata.apiDocs}
>
    <EditProps.Prop name="Event content" type="text" bind:value={eventContent} />
  </ComponentPageTemplate>
{/if}
