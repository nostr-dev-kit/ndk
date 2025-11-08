<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { zapMetadata, zapButtonCard, zapButtonAvatarsCard } from '$lib/component-registry/zap';
  import { EditProps } from '$lib/site-components/edit-props';

  // Import code examples
  import zapButtonCode from './zap-button.example?raw';
  import zapButtonAvatarsCode from './zap-button-avatars.example?raw';

  // Import components
  import ZapButton from '$lib/registry/components/zap/buttons/basic/zap-button.svelte';
  import ZapButtonAvatars from '$lib/registry/components/zap-button-avatars/zap-button-avatars.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();

  $effect(() => {
    (async () => {
      try {
        const event = await ndk.fetchEvent('nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j');
        if (event && !sampleEvent) sampleEvent = event;
      } catch (err) {
        console.error('Failed to fetch sample event:', err);
      }
    })();
  });
</script>

<!-- Preview snippets for showcase -->
{#snippet zapButtonsPreview()}
  {#if sampleEvent}
    <div class="flex gap-4 items-center flex-wrap">
      <ZapButton {ndk} event={sampleEvent} variant="ghost" />
      <ZapButton {ndk} event={sampleEvent} variant="outline" />
      <ZapButton {ndk} event={sampleEvent} variant="pill" />
      <ZapButton {ndk} event={sampleEvent} variant="solid" />
    </div>
  {/if}
{/snippet}

{#snippet avatarsPreview()}
  {#if sampleEvent}
    <div class="flex gap-4 items-center flex-wrap">
      <ZapButtonAvatars {ndk} event={sampleEvent} variant="ghost" />
      <ZapButtonAvatars {ndk} event={sampleEvent} variant="outline" />
      <ZapButtonAvatars {ndk} event={sampleEvent} variant="pill" />
      <ZapButtonAvatars {ndk} event={sampleEvent} variant="solid" />
    </div>
  {/if}
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  metadata={zapMetadata}
  {ndk}
  showcaseComponents={[
    {
      name: 'ZapButton',
      description: 'Basic zap button with sat count',
      command: 'npx jsrepo add zap-button',
      preview: zapButtonsPreview,
      cardData: zapMetadata.cards[0],
      orientation: 'horizontal'
    },
    {
      name: 'Zapper Avatars',
      description: 'Show avatars of people who zapped',
      command: 'npx jsrepo add zap-button-avatars',
      preview: avatarsPreview,
      orientation: 'horizontal'
    }
  ]}
  componentsSection={{
    cards: [
      { ...zapButtonCard, code: zapButtonCode },
      { ...zapButtonAvatarsCard, code: zapButtonAvatarsCode }
    ],
    previews: {
      'zap-button': zapButtonsPreview,
      'zap-button-avatars': avatarsPreview
    }
  }}
  apiDocs={zapMetadata.apiDocs}
>
  <EditProps.Prop
    name="Sample Event"
    type="event"
    default="nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j"
    bind:value={sampleEvent}
  />
</ComponentPageTemplate>
