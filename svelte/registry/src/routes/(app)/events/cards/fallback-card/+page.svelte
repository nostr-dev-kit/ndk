<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';

  // Import code examples
  import fallbackCardCode from './examples/basic/index.txt?raw';
  import basicSimpleCode from './examples/basic-simple/index.txt?raw';

  // Import components
  import FallbackCard from '$lib/registry/components/event-card-fallback/fallback-card.svelte';
  import { FallbackEventBasic } from '$lib/registry/components/fallback-event-basic';

  // Import registry metadata
  import fallbackCardMetadata from '$lib/registry/components/event-card-fallback/metadata.json';
  import basicSimpleMetadata from '$lib/registry/components/fallback-event-basic/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Fallback Event Card',
    description: 'Fallback card for unknown event kinds with NIP-31 alt tag and NIP-89 app handler discovery'
  };

  const ndk = getContext<NDKSvelte>('ndk');

  // Create a sample unknown event (kind 9999)
  let eventKind = $state<number>(10002);
  let eventContent = $state<string>('This is a sample event of an unknown kind.');
  let altTag = $state<string>('A sample event demonstrating the fallback handler');

  const sampleEvent = $derived(new NDKEvent(ndk, {
    kind: eventKind,
    content: eventContent,
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000),
    tags: altTag ? [['alt', altTag]] : []
  } as any));

  const showcaseComponents = [
    {
      id: 'fallback-card',
      cardData: fallbackCardMetadata,
      preview: fallbackPreview,
      orientation: 'vertical' as const
    },
    {
      id: 'fallback-event-basic',
      cardData: basicSimpleMetadata,
      preview: basicSimplePreview,
      orientation: 'vertical' as const
    }
  ];

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...fallbackCardMetadata, code: fallbackCardCode},
      {...basicSimpleMetadata, code: basicSimpleCode}
    ],
    previews: {
      'fallback-card': fallbackCardComponentPreview,
      'fallback-event-basic': basicSimpleComponentPreview
    }
  };
</script>

<!-- Preview snippets for showcase -->
{#snippet fallbackPreview()}
  <div class="max-w-lg">
    <FallbackCard {ndk} event={sampleEvent} />
  </div>
{/snippet}

{#snippet fallbackCardComponentPreview()}
  {@render fallbackPreview()}
{/snippet}

{#snippet basicSimplePreview()}
  <div class="max-w-lg">
    <FallbackEventBasic {ndk} event={sampleEvent} />
  </div>
{/snippet}

{#snippet basicSimpleComponentPreview()}
  {@render basicSimplePreview()}
{/snippet}

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      The Fallback Event Card provides a fallback UI for displaying unknown or unsupported Nostr event kinds. It intelligently handles events that don't have dedicated card components, showing the event content with metadata and discovery options.
    </p>

    <p>
      The card respects NIP-31 by displaying the alt tag when present, which provides a human-readable description of the event. It also implements NIP-89 app handler discovery, allowing users to find and open specialized applications that can properly render the event kind.
    </p>

    <p>
      This ensures every event has a usable fallback display, preventing broken or empty cards when encountering new or custom event kinds in the wild.
    </p>
  </div>
{/snippet}

<!-- Use template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  {overview}
  {showcaseComponents}
  {componentsSection}
>
  <EditProps.Prop
    name="Event Kind"
    type="kind"
    bind:value={eventKind}
    default={10002}
  />
  <EditProps.Prop
    name="Event Content"
    type="text"
    bind:value={eventContent}
    default="This is a sample event of an unknown kind."
  />
  <EditProps.Prop
    name="Alt Tag (NIP-31)"
    type="text"
    bind:value={altTag}
    default="A sample event demonstrating the fallback handler"
  />
</ComponentPageTemplate>
