<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createReactionAction } from '$lib/registry/builders/reaction-action.svelte.js';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { reactionMetadata } from '$lib/component-registry/reaction';
  import { EditProps } from '$lib/site-components/edit-props';
  import SectionTitle from '$lib/site-components/SectionTitle.svelte';
  import Preview from '$lib/site-components/preview.svelte';

  // Import code examples
  import reactionBasicCode from './reaction-button.example?raw';
  import reactionDelayedCode from './delayed-reactions.example?raw';
  import reactionBuilderCode from './reaction-builder.example?raw';

  // Import components
  import { Reaction } from '$lib/registry/components/reaction';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();
</script>

<!-- Preview snippets for showcase -->
{#snippet reactionBasicPreview()}
  {#if sampleEvent}
    <div class="flex gap-4 items-center flex-wrap">
      <Reaction.Button {ndk} event={sampleEvent} />
    </div>
  {/if}
{/snippet}

{#snippet reactionDelayedPreview()}
  {#if sampleEvent}
    <div class="flex gap-4 items-center flex-wrap">
      <Reaction.Button {ndk} event={sampleEvent} delayed={5} />
      <p class="text-sm text-muted-foreground mt-2">Reactions are delayed 5 seconds. Click again to cancel.</p>
    </div>
  {/if}
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  metadata={reactionMetadata}
  {ndk}
  showcaseComponents={[
    {
      cardData: reactionMetadata.cards[0],
      preview: reactionBasicPreview,
      orientation: 'horizontal'
    },
    {
      cardData: reactionMetadata.cards[1],
      preview: reactionDelayedPreview,
      orientation: 'horizontal'
    }
  ]}
  componentsSection={{
    cards: reactionMetadata.cards.map((card, i) => ({
      ...card,
      code: i === 0 ? reactionBasicCode : i === 1 ? reactionDelayedCode : reactionBuilderCode
    })),
    previews: {
      'reaction-basic': reactionBasicPreview,
      'reaction-delayed': reactionDelayedPreview
    }
  }}
  apiDocs={reactionMetadata.apiDocs}
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