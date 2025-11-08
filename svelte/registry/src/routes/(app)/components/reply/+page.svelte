<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { replyMetadata, replyButtonCard } from '$lib/component-registry/reply';
  import { EditProps } from '$lib/site-components/edit-props';

  // Import code examples
  import replyButtonCode from './reply-button.example?raw';

  // Import components
  import ReplyButton from '$lib/registry/components/reply/buttons/basic/reply-button.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();

  $effect(() => {
    (async () => {
      try {
        const event = await ndk.fetchEvent('nevent1qqswdxy9rwcvcjpf5v577eqkzmhus2x5878tpsmrtglgqdzdexulzsg3rjsjj');
        if (event && !sampleEvent) sampleEvent = event;
      } catch (err) {
        console.error('Failed to fetch sample event:', err);
      }
    })();
  });
</script>

<!-- Preview snippets for showcase -->
{#snippet replyButtonsPreview()}
  {#if sampleEvent}
    <div class="flex gap-4 items-center flex-wrap">
      <ReplyButton {ndk} event={sampleEvent} variant="ghost" />
      <ReplyButton {ndk} event={sampleEvent} variant="outline" />
      <ReplyButton {ndk} event={sampleEvent} variant="pill" />
      <ReplyButton {ndk} event={sampleEvent} variant="solid" />
    </div>
  {/if}
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  metadata={replyMetadata}
  {ndk}
  showcaseComponents={[
    {
      cardData: replyMetadata.cards[0],
      preview: replyButtonsPreview,
      orientation: 'horizontal'
    }
  ]}
  componentsSection={{
    cards: [
      { ...replyButtonCard, code: replyButtonCode }
    ],
    previews: {
      'reply-button': replyButtonsPreview
    }
  }}
  apiDocs={replyMetadata.apiDocs}
>
  <EditProps.Prop
    name="Sample Event"
    type="event"
    default="nevent1qqswdxy9rwcvcjpf5v577eqkzmhus2x5878tpsmrtglgqdzdexulzsg3rjsjj"
    bind:value={sampleEvent}
  />
</ComponentPageTemplate>