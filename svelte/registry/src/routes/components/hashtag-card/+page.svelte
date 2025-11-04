<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
  import { hashtagCardMetadata, hashtagCardPortraitCard, hashtagCardCompactCard } from '$lib/component-registry/hashtag-card';
  import { EditProps } from '$lib/site-components/edit-props';
  import type { ShowcaseBlock } from '$lib/templates/types';

  // Import hashtag card variants
  import HashtagCardPortrait from '$lib/registry/components/hashtag-card/hashtag-card-portrait.svelte';
  import HashtagCardCompact from '$lib/registry/components/hashtag-card/hashtag-card-compact.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let hashtag1 = $state<string>('bitcoin');
  let hashtag2 = $state<string>('nostr');
  let hashtag3 = $state<string>('freedom');
  let hashtag4 = $state<string>('art');
  let hashtag5 = $state<string>('photography');

  const displayHashtags = $derived([hashtag1, hashtag2, hashtag3, hashtag4, hashtag5].filter(Boolean));
</script>

{#if displayHashtags.length > 0}
  <!-- EditProps snippet -->
  {#snippet editPropsSection()}
    {#key displayHashtags}
      <EditProps.Root>
        <EditProps.Prop name="Hashtag 1" type="text" bind:value={hashtag1} default="bitcoin" />
        <EditProps.Prop name="Hashtag 2" type="text" bind:value={hashtag2} default="nostr" />
        <EditProps.Prop name="Hashtag 3" type="text" bind:value={hashtag3} default="freedom" />
        <EditProps.Prop name="Hashtag 4" type="text" bind:value={hashtag4} default="art" />
        <EditProps.Prop name="Hashtag 5" type="text" bind:value={hashtag5} default="photography" />
        <EditProps.Button>Edit Examples</EditProps.Button>
      </EditProps.Root>
    {/key}
  {/snippet}

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

  <!-- Showcase blocks with preview snippets -->
  {@const showcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Portrait',
      description: 'Vertical card with stats, activity chart, recent note, and contributors. Perfect for hashtag galleries.',
      command: 'npx shadcn@latest add hashtag-card-portrait',
      preview: portraitPreview,
      cardData: hashtagCardPortraitCard
    },
    {
      name: 'Compact',
      description: 'Horizontal layout for lists. Shows hashtag, note count, contributors, and follow button.',
      command: 'npx shadcn@latest add hashtag-card-compact',
      preview: compactPreview,
      cardData: hashtagCardCompactCard
    }
  ]}

  <!-- Use the template -->
  <ComponentPageTemplate
    metadata={hashtagCardMetadata}
    {ndk}
    showcaseComponent={ComponentsShowcase}
    {showcaseBlocks}
    {editPropsSection}
    componentsSection={{
      cards: hashtagCardMetadata.cards,
      previews: {
        'hashtag-card-portrait': portraitComponentPreview,
        'hashtag-card-compact': compactComponentPreview
      }
    }}
    apiDocs={hashtagCardMetadata.apiDocs}
  />
{:else}
  <!-- Custom content when no hashtags -->
  {#snippet customContent()}
    <div class="px-8">
      <div class="mb-12 pt-8">
        <div class="flex items-start justify-between gap-4 mb-4">
          <h1 class="text-4xl font-bold">Hashtag Card</h1>
        </div>
        <p class="text-lg text-muted-foreground mb-6">
          Display hashtag activity and statistics. Track conversations, see contributors, and follow topics that interest you.
        </p>
      </div>
      <div class="flex items-center justify-center py-12">
        <div class="text-muted-foreground">Add hashtags to see the components...</div>
      </div>
    </div>
  {/snippet}

  <ComponentPageTemplate
    metadata={hashtagCardMetadata}
    {ndk}
    {customContent}
    showcaseBlocks={[]}
    componentsSection={{
      cards: [],
      previews: {}
    }}
    apiDocs={[]}
  />
{/if}
