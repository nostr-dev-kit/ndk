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
  import ReactionButton from '$lib/registry/components/reaction-button/reaction-button.svelte';
  import ReactionButtonAvatars from '$lib/registry/components/reaction-button-avatars/reaction-button-avatars.svelte';
  import ReactionButtonSlack from '$lib/registry/components/reaction-button-slack/reaction-button-slack.svelte';

  // Import registry metadata
  import reactionButtonCard from '$lib/registry/components/reaction-button/metadata.json';
  import reactionButtonAvatarsCard from '$lib/registry/components/reaction-button-avatars/metadata.json';
  import reactionDisplaySlackCard from '$lib/registry/components/reaction-button-slack/metadata.json';
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
      {...reactionDisplaySlackCard, name: 'reaction-button-slack-horizontal', id: 'reaction-button-slack-horizontal', code: reactionSlackHorizontalCode, title: "Slack-style (Horizontal)"},
      {...reactionDisplaySlackCard, name: 'reaction-button-slack-vertical', id: 'reaction-button-slack-vertical', code: reactionSlackVerticalCode, title: "Slack-style (Vertical)"}
    ],
    previews: {
      'reaction': reactionButtonComponentPreview,
      'reaction-button-avatars': reactionButtonAvatarsComponentPreview,
      'reaction-button-slack-horizontal': reactionSlackHorizontalComponentPreview,
      'reaction-button-slack-vertical': reactionSlackVerticalComponentPreview
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

{#snippet reactionSlackVerticalComponentPreview()}
  {#if sampleEvent}
    {@render slackVerticalPreview()}
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

{#snippet reactionButtonComponentPreview()}
  {#if sampleEvent}
    {@render reactionButtonsPreview()}
  {/if}
{/snippet}

{#snippet reactionButtonAvatarsComponentPreview()}
  {#if sampleEvent}
    {@render avatarsPreview()}
  {/if}
{/snippet}

{#snippet reactionSlackHorizontalComponentPreview()}
  {#if sampleEvent}
    {@render slackHorizontalPreview()}
  {/if}
{/snippet}

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      Reaction buttons enable users to react to Nostr events with emoji. Clicking a reaction button toggles the reaction - if you haven't reacted, it publishes a reaction event; if you've already reacted, it deletes your reaction.
    </p>

    <p>
      The buttons support multiple visual variants (ghost, outline, pill, solid) and can display reaction counts, user avatars, and multiple emojis in Slack-style layouts. All reactions are published as NIP-25 reaction events.
    </p>

    <p>
      For custom emoji support, reactions can also handle NIP-30 custom emoji data with shortcodes and image URLs.
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
      id: "reactionButton",
      cardData: { ...reactionButtonCard, title: "Basic Variants" },
      preview: reactionButtonsPreview,
      orientation: 'horizontal'
    },
    {
      id: "reactionButtonAvatars",
      cardData: { ...reactionButtonAvatarsCard, title: "With Avatars" },
      preview: avatarsPreview,
      orientation: 'horizontal'
    },
    {
      id: "slackReactions",
      cardData: { ...reactionDisplaySlackCard, title: "Slack-style" },
      preview: slackPreview,
      orientation: slackVariant,
      control: slackControl
    }
  ]}
  {componentsSection}
  buildersSection={{
    builders: [reactionActionBuilder]
  }}
>
  <EditProps.Prop
    name="Sample Event"
    type="event"
    default="nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j"
    bind:value={sampleEvent}
  />
</ComponentPageTemplate>