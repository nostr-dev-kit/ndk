<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';  import { EditProps } from '$lib/site/components/edit-props';
  import type { ShowcaseComponent } from '$lib/site/templates/types';

  import BasicExample from './examples/basic.example.svelte';
  import CustomSnippetsExample from './examples/custom-snippets.example.svelte';

  // Page metadata
  const contentNoteBasicCard = {
    name: 'content-note-basic',
    title: 'Plain Text Basic',
    category: 'event',
    subcategory: 'content',
    variant: 'basic',
    description: 'Basic plain text content display'
  };

  const contentNoteCustomSnippetsCard = {
    name: 'content-note-custom',
    title: 'Plain Text Custom',
    category: 'event',
    subcategory: 'content',
    variant: 'custom',
    description: 'Custom snippets for plain text content'
  };

  const metadata = {
    title: 'Plain Text Content',
    description: 'Components for rendering plain text event content',
    cards: [contentNoteBasicCard, contentNoteCustomSnippetsCard],
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

  const showcaseComponents: ShowcaseComponent[] = [
    {
      cardData: contentNoteBasicCard,
      preview: basicPreview
    },
    {
      cardData: contentNoteCustomSnippetsCard,
      preview: customSnippetsPreview
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
  {@const previews = {
    'event-rendering-basic': basicComponentPreview,
    'event-rendering-custom-snippets': customSnippetsComponentPreview
  } as any}
  <ComponentPageTemplate
  metadata={metadata}
  {ndk}
  {showcaseComponents}componentsSection={{
    cards: metadata.cards,
    previews
  }}
  apiDocs={metadata.apiDocs}
>
    <EditProps.Prop name="Event content" type="text" bind:value={eventContent} />
  </ComponentPageTemplate>
{/if}
