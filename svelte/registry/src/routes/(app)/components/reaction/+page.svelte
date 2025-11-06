<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createReactionAction } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { reactionMetadata, reactionButtonCard, reactionButtonAvatarsCard, reactionSlackCard } from '$lib/component-registry/reaction';
  import { EditProps } from '$lib/site-components/edit-props';
  import SectionTitle from '$lib/site-components/SectionTitle.svelte';
  import Preview from '$lib/site-components/preview.svelte';

  // Import code examples
  import reactionButtonCode from './reaction-button.example?raw';
  import reactionButtonAvatarsCode from './reaction-button-avatars.example?raw';
  import reactionSlackCode from './reaction-slack.example?raw';
  import reactionBuilderCode from './reaction-builder.example?raw';

  // Import components
  import ReactionButton from '$lib/registry/components/reaction/reaction-button.svelte';
  import ReactionButtonAvatars from '$lib/registry/components/reaction-button-avatars/reaction-button-avatars.svelte';
  import ReactionSlack from '$lib/registry/components/reaction/reaction-slack.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();
</script>

<!-- Preview snippets for showcase -->
{#snippet reactionButtonsPreview()}
  {#if sampleEvent}
    <div class="flex gap-4 items-center flex-wrap">
      <ReactionButton {ndk} event={sampleEvent} variant="ghost" />
      <ReactionButton {ndk} event={sampleEvent} variant="outline" />
      <ReactionButton {ndk} event={sampleEvent} variant="pill" />
      <ReactionButton {ndk} event={sampleEvent} variant="solid" />
    </div>
  {/if}
{/snippet}

{#snippet avatarsPreview()}
  {#if sampleEvent}
    <div class="flex gap-4 items-center flex-wrap">
      <ReactionButtonAvatars {ndk} event={sampleEvent} variant="ghost" />
      <ReactionButtonAvatars {ndk} event={sampleEvent} variant="outline" />
      <ReactionButtonAvatars {ndk} event={sampleEvent} variant="pill" />
      <ReactionButtonAvatars {ndk} event={sampleEvent} variant="solid" />
    </div>
  {/if}
{/snippet}

{#snippet slackPreview()}
  {#if sampleEvent}
    <div class="space-y-6">
      <div>
        <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Horizontal</h4>
        <ReactionSlack {ndk} event={sampleEvent} variant="horizontal" />
      </div>
      <div>
        <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Vertical</h4>
        <ReactionSlack {ndk} event={sampleEvent} variant="vertical" />
      </div>
    </div>
  {/if}
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  metadata={reactionMetadata}
  {ndk}
  showcaseBlocks={[
    {
      name: 'ReactionButton',
      description: 'Basic reaction button with count',
      command: 'npx jsrepo add reaction-button',
      preview: reactionButtonsPreview,
      cardData: reactionMetadata.cards[0],
      orientation: 'horizontal'
    },
    {
      name: 'Reaction Authors Avatars',
      description: 'Show avatars of people who reacted',
      command: 'npx jsrepo add reaction-button-avatars',
      preview: avatarsPreview,
      orientation: 'horizontal'
    },
    {
      name: 'ReactionSlack',
      description: 'Slack-style reactions display',
      command: 'npx jsrepo add reaction-slack',
      preview: slackPreview,
      cardData: reactionMetadata.cards[2],
      orientation: 'vertical'
    }
  ]}
  componentsSection={{
    cards: [
      { ...reactionButtonCard, code: reactionButtonCode },
      { ...reactionButtonAvatarsCard, code: reactionButtonAvatarsCode },
      { ...reactionSlackCard, code: reactionSlackCode }
    ],
    previews: {
      'reaction-button': reactionButtonsPreview,
      'reaction-button-avatars': avatarsPreview,
      'reaction-slack': slackPreview
    }
  }}
  apiDocs={reactionMetadata.apiDocs}
>
  {#snippet customSections()}
    <SectionTitle
      title="Builder Pattern"
      description="All reaction components use the createReactionAction builder from @nostr-dev-kit/svelte. This builder provides reactive state management for reactions, making it easy to build custom reaction interfaces."
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
