<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import { EditProps } from '$lib/site/components/edit-props';

  // Import code examples
  import replyButtonCode from './examples/basic/index.txt?raw';
  import replyButtonAvatarsCode from './examples/avatars/index.txt?raw';

  // Import components
  import ReplyButton from '$lib/registry/components/reply/buttons/basic/reply-button.svelte';
  import ReplyButtonAvatars from '$lib/registry/components/reply/buttons/avatars/reply-button-avatars.svelte';

  // Import registry metadata
  import replyButtonCard from '$lib/registry/components/reply/buttons/basic/registry.json';
  import replyButtonAvatarsCard from '$lib/registry/components/reply/buttons/avatars/registry.json';

  // Page metadata
  const metadata = {
    title: 'Reply',
    description: 'Reply buttons and components for Nostr events'
  };

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

{#snippet avatarsPreview()}
  {#if sampleEvent}
    <div class="flex gap-4 items-center flex-wrap">
      <ReplyButtonAvatars {ndk} event={sampleEvent} variant="ghost" />
      <ReplyButtonAvatars {ndk} event={sampleEvent} variant="outline" />
      <ReplyButtonAvatars {ndk} event={sampleEvent} variant="pill" />
      <ReplyButtonAvatars {ndk} event={sampleEvent} variant="solid" />
    </div>
  {/if}
{/snippet}

<!-- Components snippet -->
{#snippet components()}
  <ComponentCard data={{...replyButtonCard, code: replyButtonCode}}>
    {#snippet preview()}
      {@render replyButtonsPreview()}
    {/snippet}
  </ComponentCard>

  <ComponentCard data={{...replyButtonAvatarsCard, code: replyButtonAvatarsCode}}>
    {#snippet preview()}
      {@render avatarsPreview()}
    {/snippet}
  </ComponentCard>
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  showcaseComponents={[
    {
      id: "replyButtonCard",
      cardData: replyButtonCard,
      preview: replyButtonsPreview,
      orientation: 'horizontal'
    },
    {
      id: "replyButtonAvatarsCard",
      cardData: replyButtonAvatarsCard,
      preview: avatarsPreview,
      orientation: 'horizontal'
    }
  ]}
  {components}
>
  <EditProps.Prop
    name="Sample Event"
    type="event"
    default="nevent1qqswdxy9rwcvcjpf5v577eqkzmhus2x5878tpsmrtglgqdzdexulzsg3rjsjj"
    bind:value={sampleEvent}
  />
</ComponentPageTemplate>