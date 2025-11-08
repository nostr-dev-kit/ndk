<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { repostMetadata, repostButtonCard, repostButtonAvatarsCard } from '$lib/component-registry/repost';
  import { EditProps } from '$lib/site-components/edit-props';

  // Import code examples
  import repostButtonCode from './repost-button.example?raw';
  import repostButtonAvatarsCode from './repost-button-avatars.example?raw';

  // Import components
  import RepostButton from '$lib/registry/components/repost-button/repost-button.svelte';
  import RepostButtonAvatars from '$lib/registry/components/repost-button-avatars/repost-button-avatars.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();
  let showQuoteDropdown = $state(false);

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

  function handleQuote() {
    console.log('Quote handler called - you would open your quote composer here');
  }
</script>

<!-- Preview snippets for showcase -->
{#snippet repostButtonsPreview()}
  {#if sampleEvent}
    <div class="flex gap-4 items-center flex-wrap">
      <RepostButton
        {ndk}
        event={sampleEvent}
        variant="ghost"
        onquote={showQuoteDropdown ? handleQuote : undefined}
      />
      <RepostButton
        {ndk}
        event={sampleEvent}
        variant="outline"
        onquote={showQuoteDropdown ? handleQuote : undefined}
      />
      <RepostButton
        {ndk}
        event={sampleEvent}
        variant="pill"
        onquote={showQuoteDropdown ? handleQuote : undefined}
      />
      <RepostButton
        {ndk}
        event={sampleEvent}
        variant="solid"
        onquote={showQuoteDropdown ? handleQuote : undefined}
      />
    </div>
  {/if}
{/snippet}

{#snippet avatarsPreview()}
  {#if sampleEvent}
    <div class="flex gap-4 items-center flex-wrap">
      <RepostButtonAvatars {ndk} event={sampleEvent} variant="ghost" />
      <RepostButtonAvatars {ndk} event={sampleEvent} variant="outline" />
      <RepostButtonAvatars {ndk} event={sampleEvent} variant="pill" />
      <RepostButtonAvatars {ndk} event={sampleEvent} variant="solid" />
    </div>
  {/if}
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  metadata={repostMetadata}
  {ndk}
  showcaseComponents={[
    {
      name: 'RepostButton',
      description: 'Basic repost button with count',
      command: 'npx jsrepo add repost-button',
      preview: repostButtonsPreview,
      cardData: repostMetadata.cards[0],
      orientation: 'horizontal'
    },
    {
      name: 'Repost Authors Avatars',
      description: 'Show avatars of people who reposted',
      command: 'npx jsrepo add repost-button-avatars',
      preview: avatarsPreview,
      orientation: 'horizontal'
    }
  ]}
  componentsSection={{
    cards: [
      { ...repostButtonCard, code: repostButtonCode },
      { ...repostButtonAvatarsCard, code: repostButtonAvatarsCode }
    ],
    previews: {
      'repost-button': repostButtonsPreview,
      'repost-button-avatars': avatarsPreview
    }
  }}
  apiDocs={repostMetadata.apiDocs}
>
  <EditProps.Prop
    name="Sample Event"
    type="event"
    default="nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j"
    bind:value={sampleEvent}
  />
  <EditProps.Prop
    name="Show Quote Dropdown"
    type="boolean"
    default={false}
    bind:value={showQuoteDropdown}
  />
</ComponentPageTemplate>
