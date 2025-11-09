<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';

  // Import code examples
  import repostButtonCode from './examples/basic/index.txt?raw';
  import repostButtonAvatarsCode from './examples/avatars/index.txt?raw';

  // Import components
  import RepostButton from '$lib/registry/components/repost-button/repost-button.svelte';
  import RepostButtonAvatars from '$lib/registry/components/repost-button-avatars/repost-button-avatars.svelte';

  // Import registry metadata
  import repostButtonCard from '$lib/registry/components/repost-button/metadata.json';
  import repostButtonAvatarsCard from '$lib/registry/components/repost-button-avatars/metadata.json';
  import repostActionBuilder from '$lib/registry/builders/repost-action/metadata.json';

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
    // Open quote composer here
  }

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...repostButtonCard, code: repostButtonCode},
      {...repostButtonAvatarsCard, code: repostButtonAvatarsCode}
    ],
    previews: {
      'repost-button': repostButtonComponentPreview,
      'repost-button-avatars': repostButtonAvatarsComponentPreview
    }
  };
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

{#snippet repostButtonComponentPreview()}
  {#if sampleEvent}
    {@render repostButtonsPreview()}
  {/if}
{/snippet}

{#snippet repostButtonAvatarsComponentPreview()}
  {#if sampleEvent}
    {@render avatarsPreview()}
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

<!-- Use the template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  {overview}
  showcaseComponents={[
    {
      id: "repostButtonCard",
      cardData: { ...repostButtonCard, title: "Basic Variants" },
      preview: repostButtonsPreview,
      orientation: 'horizontal'
    },
    {
      id: "repostButtonAvatarsCard",
      cardData: { ...repostButtonAvatarsCard, title: "With Avatars" },
      preview: avatarsPreview,
      orientation: 'horizontal'
    }
  ]}
  {componentsSection}
  buildersSection={{
    builders: [repostActionBuilder]
  }}
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
