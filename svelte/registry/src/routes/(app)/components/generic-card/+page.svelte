<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';
  import type { ShowcaseComponent } from '$lib/site/templates/types';

  // Import code example
  import genericCardCode from './generic-card.example?raw';

  // Import component
  import GenericCard from '$lib/registry/components/event/cards/generic/generic-card.svelte';

  // Import registry metadata
  import genericCardMetadata from '$lib/registry/components/event/cards/generic/registry.json';

  // Page metadata
  const metadata = {
    title: 'Generic Event Card',
    description: 'Fallback card for unknown event kinds with NIP-31 alt tag and NIP-89 app handler discovery',
    showcaseTitle: 'Generic Card',
    showcaseDescription: 'Universal fallback for displaying any event type without a specific handler',
  };

  const ndk = getContext<NDKSvelte>('ndk');

  // Create a sample unknown event (kind 9999)
  let eventKind = $state<number>(9999);
  let eventContent = $state<string>('This is a sample event of an unknown kind.');
  let altTag = $state<string>('A sample event demonstrating the generic fallback handler');

  const sampleEvent = $derived(new NDKEvent(ndk, {
    kind: eventKind,
    content: eventContent,
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000),
    tags: altTag ? [['alt', altTag]] : []
  } as any));

  const showcaseComponents: ShowcaseComponent[] = [
    {
      cardData: genericCardMetadata,
      preview: genericPreview,
      orientation: 'vertical'
    }
  ];
</script>

<!-- Preview snippets for showcase -->
{#snippet genericPreview()}
  <div class="max-w-lg">
    <GenericCard {ndk} event={sampleEvent} />
  </div>
{/snippet}

<!-- Components section preview -->
{#snippet genericComponentPreview()}
  <div class="max-w-lg">
    <GenericCard {ndk} event={sampleEvent} />
  </div>
{/snippet}

<!-- Use template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  {showcaseComponents}
  componentsSection={{
    cards: [{ ...genericCardMetadata, code: genericCardCode }],
    previews: {
      'generic-card': genericComponentPreview
    }
  }}
>
  <EditProps.Prop
    name="Event Kind"
    type="number"
    bind:value={eventKind}
    default={9999}
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
    default="A sample event demonstrating the generic fallback handler"
  />
</ComponentPageTemplate>
