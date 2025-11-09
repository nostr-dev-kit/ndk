<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import { EditProps } from '$lib/site/components/edit-props';

  // Import code examples
  import repostButtonCode from './examples/basic/index.txt?raw';
  import repostButtonAvatarsCode from './examples/avatars/index.txt?raw';

  // Import components
  import RepostButton from '$lib/registry/components/repost/buttons/basic/repost-button.svelte';
  import RepostButtonAvatars from '$lib/registry/components/repost/buttons/avatars/repost-button-avatars.svelte';

  // Import registry metadata
  import repostButtonCard from '$lib/registry/components/repost/buttons/basic/metadata.json';
  import repostButtonAvatarsCard from '$lib/registry/components/repost/buttons/avatars/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Repost Buttons',
    description: 'Interactive repost buttons with quote support and multiple variants'
  };

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

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      The Repost Button enables users to repost or unrepost Nostr events. Clicking the button toggles the repost state - if you haven't reposted, it reposts; if you've already reposted, it unreposts.
    </p>

    <p>
      When reposting an event, the button publishes a kind 6 (Repost) or kind 16 (GenericRepost) event that references the original event. The button displays a count of how many users have reposted the event.
    </p>

    <p>
      The button can optionally support quote reposts by providing an <code class="px-2 py-1 bg-muted rounded text-sm">onquote</code> handler. When provided, the button displays a dropdown menu with "Repost" and "Quote" options, allowing users to choose between a regular repost or opening a composer to quote the event.
    </p>
  </div>
{/snippet}

<!-- Components snippet -->
{#snippet components()}
  <ComponentCard data={{...repostButtonCard, code: repostButtonCode}}>
    {#snippet preview()}
      {@render repostButtonsPreview()}
    {/snippet}
  </ComponentCard>

  <ComponentCard data={{...repostButtonAvatarsCard, code: repostButtonAvatarsCode}}>
    {#snippet preview()}
      {@render avatarsPreview()}
    {/snippet}
  </ComponentCard>
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  {overview}
  showcaseComponents={[
    {
      id: "repostButtonCard",
      cardData: repostButtonCard,
      preview: repostButtonsPreview,
      orientation: 'horizontal'
    },
    {
      id: "repostButtonAvatarsCard",
      cardData: repostButtonAvatarsCard,
      preview: avatarsPreview,
      orientation: 'horizontal'
    }
  ]}
  {components}
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
