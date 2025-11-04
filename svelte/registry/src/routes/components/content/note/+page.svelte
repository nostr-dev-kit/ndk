<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';

  import BasicExample from './examples/basic.svelte';
  import CustomSnippetsExample from './examples/custom-snippets.svelte';

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

  const basicData = {
    name: 'event-content-basic',
    title: 'Basic Content Rendering',
    description: 'Auto-detects content types.',
    richDescription: 'Automatically detects and renders mentions, hashtags, links, images, videos, YouTube embeds, and custom emojis.',
    command: 'npx shadcn@latest add event-content',
    apiDocs: []
  };

  const customSnippetsData = {
    name: 'event-content-custom-snippets',
    title: 'Custom Snippets',
    description: 'Override default rendering.',
    richDescription: 'Use custom snippets to override default rendering for any content type (mentions, hashtags, links, etc.).',
    command: 'npx shadcn@latest add event-content',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">Event Content</h1>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Rich event content renderer with automatic parsing of mentions, hashtags, links, media, and custom emojis.
    </p>

    <EditProps.Root>
      <EditProps.Prop name="Event content" type="text" bind:value={eventContent} />
      <EditProps.Button>Edit Examples</EditProps.Button>
    </EditProps.Root>
  </div>

  <!-- Examples Showcase -->
  {#snippet basicPreview()}
    <BasicExample {ndk} event={exampleEvent} />
  {/snippet}

  {#snippet customSnippetsPreview()}
    <CustomSnippetsExample {ndk} event={exampleEvent} />
  {/snippet}

  <ComponentPageSectionTitle
    title="Examples"
    description="Different ways to use EventContent component."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'Basic Rendering',
        description: 'Auto-detects content',
        command: 'npx shadcn@latest add event-content',
        preview: basicPreview,
        cardData: basicData
      },
      {
        name: 'Custom Snippets',
        description: 'Override rendering',
        command: 'npx shadcn@latest add event-content',
        preview: customSnippetsPreview,
        cardData: customSnippetsData
      }
    ]}
  />

  <!-- Components Section -->
  <ComponentPageSectionTitle title="Components" description="Explore each variant in detail" />

  <section class="py-12 space-y-16">
    <ComponentCard inline data={basicData}>
      {#snippet preview()}
        <BasicExample {ndk} event={exampleEvent} />
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={customSnippetsData}>
      {#snippet preview()}
        <CustomSnippetsExample {ndk} event={exampleEvent} />
      {/snippet}
    </ComponentCard>
  </section>
</div>
