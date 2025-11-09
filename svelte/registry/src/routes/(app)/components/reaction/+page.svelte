<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';

  // Import code examples
  import reactionButtonCode from './examples/button-variants/index.txt?raw';
  import reactionButtonAvatarsCode from './examples/avatars/index.txt?raw';
  import reactionSlackHorizontalCode from './examples/slack-horizontal/index.txt?raw';
  import reactionSlackVerticalCode from './examples/slack-vertical/index.txt?raw';

  // Import components
  import ReactionButton from '$lib/registry/components/reaction/buttons/basic/reaction-button.svelte';
  import ReactionButtonAvatars from '$lib/registry/components/reaction/buttons/avatars/reaction-button-avatars.svelte';
  import ReactionButtonSlack from '$lib/registry/components/reaction/buttons/slack/reaction-button-slack.svelte';

  // Import registry metadata
  import reactionButtonCard from '$lib/registry/components/reaction/buttons/basic/metadata.json';
  import reactionButtonAvatarsCard from '$lib/registry/components/reaction/buttons/avatars/metadata.json';
  import reactionDisplaySlackCard from '$lib/registry/components/reaction/buttons/slack/metadata.json';
  import reactionActionBuilder from '$lib/registry/builders/reaction-action/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Reactions',
    description: 'Interactive reaction buttons and displays with emoji picker, avatars, and Slack-style layouts'
  };

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();
  let slackVariant = $state<'horizontal' | 'vertical'>('horizontal');

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...reactionButtonCard, code: reactionButtonCode},
      {...reactionButtonAvatarsCard, code: reactionButtonAvatarsCode},
      {...reactionDisplaySlackCard, code: reactionSlackHorizontalCode, title: "Slack-style (Horizontal)"},
      {...reactionDisplaySlackCard, code: reactionSlackVerticalCode, title: "Slack-style (Vertical)"}
    ],
    previews: {
      'reaction': reactionButtonComponentPreview,
      'reaction-button-avatars': reactionButtonAvatarsComponentPreview,
      'reaction-button-slack': reactionSlackHorizontalComponentPreview
    }
  };
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
    <ReactionButtonSlack {ndk} event={sampleEvent} variant={slackVariant} />
  {/if}
{/snippet}

{#snippet slackHorizontalPreview()}
  {#if sampleEvent}
    <ReactionButtonSlack {ndk} event={sampleEvent} variant="horizontal" />
  {/if}
{/snippet}

{#snippet slackVerticalPreview()}
  {#if sampleEvent}
    <ReactionButtonSlack {ndk} event={sampleEvent} variant="vertical" />
  {/if}
{/snippet}

{#snippet slackControl()}
  <div class="flex flex-col gap-2">
    <button
      onclick={() => slackVariant = 'horizontal'}
      class="px-4 py-2 rounded-md text-sm transition-colors {slackVariant === 'horizontal' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
    >
      Horizontal
    </button>
    <button
      onclick={() => slackVariant = 'vertical'}
      class="px-4 py-2 rounded-md text-sm transition-colors {slackVariant === 'vertical' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
    >
      Vertical
    </button>
  </div>
{/snippet}

<!-- Components snippet -->
{#snippet components()}
  <ComponentCard data={{...reactionButtonCard, code: reactionButtonCode}}>
    {#snippet preview()}
      {@render reactionButtonsPreview()}
    {/snippet}
  </ComponentCard>

  <ComponentCard data={{...reactionButtonAvatarsCard, code: reactionButtonAvatarsCode}}>
    {#snippet preview()}
      {@render avatarsPreview()}
    {/snippet}
  </ComponentCard>

  <ComponentCard data={{...reactionDisplaySlackCard, code: reactionSlackHorizontalCode, title: "Slack-style (Horizontal)"}}>
    {#snippet preview()}
      {@render slackHorizontalPreview()}
    {/snippet}
  </ComponentCard>

  <ComponentCard data={{...reactionDisplaySlackCard, code: reactionSlackVerticalCode, title: "Slack-style (Vertical)"}}>
    {#snippet preview()}
      {@render slackVerticalPreview()}
    {/snippet}
  </ComponentCard>
{/snippet}

<!-- Recipes snippet -->
{#snippet recipes()}
  {#if sampleEvent}
    {@const reactionState = createReactionAction(() => ({ event: sampleEvent }), ndk)}

    <Preview title="Emoji Picker Dropdown" code={dropdownHoverCode}>
      <EmojiPicker.Dropdown
        {ndk}
        onEmojiSelect={(emoji) => reactionState.react(emoji)}
      >
        <ReactionButton {ndk} event={sampleEvent} variant="ghost" />
      </EmojiPicker.Dropdown>
    </Preview>
  {/if}
{/snippet}

<!-- Primitives snippet -->
{#snippet primitives()}
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

<!-- Use the template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  showcaseComponents={[
    {
      id: "reactionButton",
      cardData: reactionButtonCard,
      preview: reactionButtonsPreview,
      orientation: 'horizontal'
    },
    {
      id: "reactionButtonAvatars",
      cardData: reactionButtonAvatarsCard,
      preview: avatarsPreview,
      orientation: 'horizontal'
    },
    {
      id: "slackReactions",
      cardData: { ...reactionDisplaySlackCard, title: "Slack-style Reactions" },
      preview: slackPreview,
      orientation: slackVariant,
      control: slackControl
    }
  ]}
  {components}
  {recipes}
  {primitives}
  apiDocs={reactionButtonCard.apiDocs}
>

  <EditProps.Prop
    name="Sample Event"
    type="event"
    default="nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j"
    bind:value={sampleEvent}
  />
</ComponentPageTemplate>