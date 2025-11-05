<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { replyMetadata, replyButtonCard, followButtonAvatarsCard } from '$lib/component-registry/reply';
  import { EditProps } from '$lib/site-components/edit-props';

  // Import code examples
  import replyButtonCode from './reply-button.example?raw';
  import followButtonAvatarsCode from './follow-button-avatars.example?raw';

  // Import components
  import ReplyButton from '$lib/registry/components/reply-button/reply-button.svelte';
  import FollowButtonAvatars from '$lib/registry/components/follow-button-avatars/follow-button-avatars.svelte';

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
      <FollowButtonAvatars {ndk} event={sampleEvent} variant="ghost" />
      <FollowButtonAvatars {ndk} event={sampleEvent} variant="outline" />
      <FollowButtonAvatars {ndk} event={sampleEvent} variant="pill" />
      <FollowButtonAvatars {ndk} event={sampleEvent} variant="solid" />
    </div>
  {/if}
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  metadata={replyMetadata}
  {ndk}
  showcaseBlocks={[
    {
      name: 'ReplyButton',
      description: 'Basic reply button with count',
      command: 'npx jsrepo add reply-button',
      preview: replyButtonsPreview,
      cardData: replyMetadata.cards[0],
      orientation: 'horizontal'
    },
    {
      name: 'Reply Authors Avatars',
      description: 'Show avatars of people who replied',
      command: 'npx jsrepo add reply-button',
      preview: avatarsPreview,
      orientation: 'horizontal'
    }
  ]}
  componentsSection={{
    cards: [
      { ...replyButtonCard, code: replyButtonCode },
      { ...followButtonAvatarsCard, code: followButtonAvatarsCode }
    ],
    previews: {
      'reply-button': replyButtonsPreview,
      'follow-button-avatars': avatarsPreview
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