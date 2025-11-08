<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createReactionAction } from '$lib/registry/builders/reaction-action.svelte.js';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import { EditProps } from '$lib/site/components/edit-props';
  import SectionTitle from '$lib/site/components/SectionTitle.svelte';
  import Preview from '$lib/site/components/preview.svelte';

  // Import code examples
  import reactionBasicCode from './examples/basic/index.txt?raw';
  import reactionDelayedCode from './examples/delayed/index.txt?raw';
  import reactionBuilderCode from './examples/builder/index.txt?raw';

  // Import components
  import { ReactionAction, ReactionLongpress } from '$lib/registry/components/reaction';

  // Import registry metadata
  import reactionLongpressCard from '$lib/registry/components/reaction/buttons/longpress/registry.json';

  // Page metadata
  const metadata = {
    title: 'Reaction Buttons',
    description: 'Interactive reaction buttons with emoji picker and delayed reactions',
    showcaseTitle: 'Reaction Variants',
    showcaseDescription: 'Add emoji reactions to events',
  };

  // Extract cards from registry
  const reactionBasicCard = reactionLongpressCard.cards[0];
  const reactionDelayedCard = reactionLongpressCard.cards[1];
  const reactionBuilderCard = reactionLongpressCard.cards[2];

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();
</script>

<!-- Preview snippets for showcase -->
{#snippet reactionBasicPreview()}
  {#if sampleEvent}
    <div class="flex gap-4 items-center flex-wrap">
      <ReactionLongpress {ndk} event={sampleEvent} />
    </div>
  {/if}
{/snippet}

{#snippet reactionDelayedPreview()}
  {#if sampleEvent}
    <div class="flex gap-4 items-center flex-wrap">
      <ReactionLongpress {ndk} event={sampleEvent} delayed={5} />
      <p class="text-sm text-muted-foreground mt-2">Reactions are delayed 5 seconds. Click again to cancel.</p>
    </div>
  {/if}
{/snippet}

<!-- Components snippet -->
{#snippet components()}
  <ComponentCard data={{...reactionBasicCard, code: reactionBasicCode}}>
    {#snippet preview()}
      {@render reactionBasicPreview()}
    {/snippet}
  </ComponentCard>

  <ComponentCard data={{...reactionDelayedCard, code: reactionDelayedCode}}>
    {#snippet preview()}
      {@render reactionDelayedPreview()}
    {/snippet}
  </ComponentCard>

  <ComponentCard data={{...reactionBuilderCard, code: reactionBuilderCode}}>
    {#snippet preview()}
      {#if sampleEvent}
        {@const reactionState = createReactionAction(() => ({ event: sampleEvent }), ndk)}
        {@const totalCount = reactionState.all.reduce((sum, r) => sum + r.count, 0)}
        <button
          onclick={() => reactionState.react('❤️')}
          class="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
        >
          <span>❤️</span>
          {#if totalCount > 0}
            <span>{totalCount}</span>
          {/if}
        </button>
      {/if}
    {/snippet}
  </ComponentCard>
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  showcaseComponents={[
    {
      cardData: reactionBasicCard,
      preview: reactionBasicPreview,
      orientation: 'horizontal'
    },
    {
      cardData: reactionDelayedCard,
      preview: reactionDelayedPreview,
      orientation: 'horizontal'
    }
  ]}
  {components}
  apiDocs={reactionLongpressCard.apiDocs}
>
  {#snippet customSections()}
    <SectionTitle
      title="Builder Pattern"
      description="The reaction component uses the createReactionAction builder from @nostr-dev-kit/svelte. This builder provides reactive state management for reactions, making it easy to build custom reaction interfaces."
    />

    <div class="py-12 space-y-8">
      {#if sampleEvent}
        {@const reactionState = createReactionAction(() => ({ event: sampleEvent }), ndk)}

        <Preview title="Building from Scratch" code={reactionBuilderCode}>
          {@const totalCount = reactionState.all.reduce((sum, r) => sum + r.count, 0)}
          <button
            onclick={() => reactionState.react('❤️')}
            class="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <span>❤️</span>
            {#if totalCount > 0}
              <span>{totalCount}</span>
            {/if}
          </button>
        </Preview>

        <div class="prose prose-sm max-w-none">
          <p class="text-muted-foreground">
            The <code>createReactionAction</code> builder returns a reactive state object that:
          </p>
          <ul class="text-muted-foreground space-y-2">
            <li>Tracks all reactions on the event</li>
            <li>Provides <code>react(emoji)</code> method to add/remove reactions</li>
            <li>Exposes <code>totalCount</code> for the total number of reactions</li>
            <li>Offers <code>get(emoji)</code> to get stats for a specific emoji</li>
            <li>Includes <code>reactions</code> map of all emoji reactions</li>
          </ul>
        </div>
      {/if}
    </div>
  {/snippet}

  <EditProps.Prop
    name="Sample Event"
    type="event"
    default="nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j"
    bind:value={sampleEvent}
  />
</ComponentPageTemplate>