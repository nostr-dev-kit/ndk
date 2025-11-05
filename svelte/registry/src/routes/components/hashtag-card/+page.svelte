<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
  import { hashtagCardMetadata, hashtagCardPortraitCard, hashtagCardCompactCard } from '$lib/component-registry/hashtag-card';
  import { EditProps } from '$lib/site-components/edit-props';
  import type { ShowcaseBlock } from '$lib/templates/types';

  // Import code examples
  import hashtagCardPortraitCode from './hashtag-card-portrait.example?raw';
  import hashtagCardCompactCode from './hashtag-card-compact.example?raw';

  // Import hashtag card variants
  import HashtagCardPortrait from '$lib/registry/components/hashtag-card-portrait/hashtag-card-portrait.svelte';
  import HashtagCardCompact from '$lib/registry/components/hashtag-card-compact/hashtag-card-compact.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let hashtag1 = $state<string>('bitcoin');
  let hashtag2 = $state<string>('nostr');
  let hashtag3 = $state<string>('freedom');
  let hashtag4 = $state<string>('art');
  let hashtag5 = $state<string>('photography');

  const displayHashtags = $derived([hashtag1, hashtag2, hashtag3, hashtag4, hashtag5].filter(Boolean));

  // Derive showcase blocks based on whether we have hashtags
  const showcaseBlocks = $derived<ShowcaseBlock[]>(
    displayHashtags.length > 0 ? [
      {
        name: 'Portrait',
        description: 'Vertical card with stats, activity chart, recent note, and contributors. Perfect for hashtag galleries.',
        command: 'npx jsrepo add hashtag-card-portrait',
        preview: portraitPreview,
        cardData: hashtagCardPortraitCard
      },
      {
        name: 'Compact',
        description: 'Horizontal layout for lists. Shows hashtag, note count, contributors, and follow button.',
        command: 'npx jsrepo add hashtag-card-compact',
        preview: compactPreview,
        cardData: hashtagCardCompactCard
      }
    ] : []
  );

  // Derive components section based on whether we have hashtags
  const componentsSection = $derived(
    displayHashtags.length > 0 ? {
      cards: [
        { ...hashtagCardPortraitCard, code: hashtagCardPortraitCode },
        { ...hashtagCardCompactCard, code: hashtagCardCompactCode }
      ],
      previews: {
        'hashtag-card-portrait': portraitComponentPreview,
        'hashtag-card-compact': compactComponentPreview
      }
    } : undefined
  );
</script>

<!-- Title section -->
<!-- Preview snippets for showcase -->
{#snippet portraitPreview()}
  <div class="flex gap-4 flex-wrap justify-center">
    {#each displayHashtags as hashtag (hashtag)}
      <HashtagCardPortrait {ndk} {hashtag} />
    {/each}
  </div>
{/snippet}

{#snippet compactPreview()}
  <div class="space-y-2 max-w-md">
    {#each displayHashtags as hashtag (hashtag)}
      <HashtagCardCompact {ndk} {hashtag} />
    {/each}
  </div>
{/snippet}

<!-- Preview snippets for components section -->
{#snippet portraitComponentPreview()}
  <div class="flex gap-4 flex-wrap justify-center">
    {#each displayHashtags as hashtag (hashtag)}
      <HashtagCardPortrait {ndk} {hashtag} />
    {/each}
  </div>
{/snippet}

{#snippet compactComponentPreview()}
  <div class="space-y-2 max-w-md">
    {#each displayHashtags as hashtag (hashtag)}
      <HashtagCardCompact {ndk} {hashtag} />
    {/each}
  </div>
{/snippet}

<!-- Empty state snippet -->
{#snippet emptyState()}
  <div class="flex items-center justify-center py-12">
    <div class="text-muted-foreground">Add hashtags to see the components...</div>
  </div>
{/snippet}

<ComponentPageTemplate
  metadata={hashtagCardMetadata}
  {ndk}
  showcaseComponent={ComponentsShowcase}
  {showcaseBlocks}{componentsSection}
  {emptyState}
  apiDocs={hashtagCardMetadata.apiDocs}
>
    {#key displayHashtags}
      <EditProps.Prop name="Hashtag 1" type="text" bind:value={hashtag1} default="bitcoin" />
      <EditProps.Prop name="Hashtag 2" type="text" bind:value={hashtag2} default="nostr" />
      <EditProps.Prop name="Hashtag 3" type="text" bind:value={hashtag3} default="freedom" />
      <EditProps.Prop name="Hashtag 4" type="text" bind:value={hashtag4} default="art" />
      <EditProps.Prop name="Hashtag 5" type="text" bind:value={hashtag5} default="photography" />
    {/key}
  </ComponentPageTemplate>
