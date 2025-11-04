<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';

  // Import block components
  import { ReactionButton, ReactionSlack, ReactionEmojiButton } from '$lib/registry/components';

  // Import examples
  import ReactionDisplayBasic from './examples/reaction-display-basic.svelte';
  import ReactionDisplayCustom from './examples/reaction-display-custom.svelte';
  import ReactionEmojiButtonExample from './examples/reaction-emoji-button-code.svelte';
  import BasicExample from './examples/reaction-action-basic.svelte';
  import SlackLikeExample from './examples/slack-like.svelte';
  import BuilderExample from './examples/reaction-action-builder.svelte';
  import DelayedExample from './examples/delayed.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();
  let nip30ReactionEvent = $state<NDKEvent | undefined>();

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

  $effect(() => {
    (async () => {
      try {
        const event = await ndk.fetchEvent('nevent1qqsr32zfznhjj7nd5ycher9gwcparzvtrvd6cdxcf769nr5ag37y5fqpzemhxue69uhhyetvv9ujuurjd9kkzmpwdejhgzy86t6');
        if (event && !nip30ReactionEvent) nip30ReactionEvent = event;
      } catch (err) {
        console.error('Failed to fetch nip-30 reaction event:', err);
      }
    })();
  });

  const reactionDisplayStandardData = {
    name: 'reaction-display-standard',
    title: 'Reaction.Display - Standard Emojis',
    description: 'Renders standard unicode emojis.',
    richDescription: 'Renders standard unicode emojis with configurable size. Perfect for displaying reaction counts and user reactions.',
    command: 'npx shadcn@latest add reaction',
    apiDocs: []
  };

  const reactionDisplayCustomData = {
    name: 'reaction-display-custom',
    title: 'Reaction.Display - Custom Emojis',
    description: 'Renders custom emoji images using NIP-30.',
    richDescription: 'Renders custom emoji images using NIP-30 emoji tags. Automatically handles both standard and custom emojis.',
    command: 'npx shadcn@latest add reaction',
    apiDocs: []
  };

  const reactionButtonData = {
    name: 'reaction-button',
    title: 'ReactionButton',
    description: 'Minimal icon-first design.',
    richDescription: 'Minimal icon-first design. Best for inline use in feeds or alongside other action buttons. Click to react with a heart.',
    command: 'npx shadcn@latest add reaction-button',
    apiDocs: []
  };

  const reactionSlackData = {
    name: 'reaction-slack',
    title: 'ReactionSlack',
    description: 'Slack-style reactions display.',
    richDescription: 'Slack-style reactions with horizontal and vertical layouts. Horizontal shows avatars in popover on hover. Vertical shows avatars inline. Best for displaying all reactions with user attribution.',
    command: 'npx shadcn@latest add reaction-slack',
    apiDocs: []
  };

  const reactionEmojiButtonData = {
    name: 'reaction-emoji-button',
    title: 'ReactionEmojiButton',
    description: 'Reaction button with emoji picker.',
    richDescription: 'Reaction button with emoji picker popover. Click to open emoji picker and select from your custom emojis and defaults. Uses bits-ui Popover component.',
    command: 'npx shadcn@latest add reaction-emoji-button',
    apiDocs: []
  };

  const basicActionData = {
    name: 'reaction-action-basic',
    title: 'Basic ReactionAction',
    description: 'Click to react, long-press for picker.',
    richDescription: 'Click to react with a heart, long-press to open emoji picker. Shows current reaction count.',
    command: 'npx shadcn@latest add reaction',
    apiDocs: []
  };

  const slackStyleData = {
    name: 'slack-style',
    title: 'Slack-Style Reactions',
    description: 'Display all reactions with attribution.',
    richDescription: 'Display all reactions sorted by count. Hover to see who reacted with each emoji. Click to add/remove your reaction.',
    command: 'npx shadcn@latest add reaction',
    apiDocs: []
  };

  const builderData = {
    name: 'builder-usage',
    title: 'Using the Builder',
    description: 'Full control with createReactionAction().',
    richDescription: 'Use createReactionAction() for full control over your UI markup with reactive state management.',
    command: 'npx shadcn@latest add reaction',
    apiDocs: []
  };

  const delayedData = {
    name: 'delayed-reactions',
    title: 'Cancellable Delayed Reactions',
    description: 'Optimistic updates with cancel option.',
    richDescription: 'Set delayed: 5 to show reactions immediately (optimistic update) but wait 5 seconds before publishing. Click again to cancel.',
    command: 'npx shadcn@latest add reaction',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <h1 class="text-4xl font-bold mb-4">Reaction</h1>
    <p class="text-lg text-muted-foreground mb-6">
      Simple reaction button with long-press emoji picker and NIP-30/NIP-51 support. Long-press to open emoji picker with custom emojis from your NIP-51 kind:10030 list.
    </p>

    <EditProps.Root>
      <EditProps.Prop
        name="Sample Event"
        type="event"
        default="nevent1qvzqqqqqqypzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqyxhwumn8ghj7e3h0ghxjme0qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qpqn35mrh4hpc53m3qge6m0exys02lzz9j0sxdj5elwh3hc0e47v3qqpq0a0n"
        bind:value={sampleEvent}
      />
      <EditProps.Prop
        name="NIP-30 Reaction"
        type="event"
        default="nevent1qqsr32zfznhjj7nd5ycher9gwcparzvtrvd6cdxcf769nr5ag37y5fqpzemhxue69uhhyetvv9ujuurjd9kkzmpwdejhgzy86t6"
        bind:value={nip30ReactionEvent}
      />
    </EditProps.Root>
  </div>

  {#if sampleEvent}
    <!-- Reaction Primitives Showcase -->
    {#snippet displayStandardPreview()}
      <ReactionDisplayBasic />
    {/snippet}

    {#snippet displayCustomPreview()}
      {#if nip30ReactionEvent}
        <ReactionDisplayCustom event={nip30ReactionEvent} />
      {/if}
    {/snippet}

    <ComponentPageSectionTitle
      title="Reaction Primitives"
      description="Low-level building blocks for rendering emoji reactions."
    />

    <ComponentsShowcaseGrid
      blocks={[
        {
          name: 'Standard Emojis',
          description: 'Unicode emoji display',
          command: 'npx shadcn@latest add reaction',
          preview: displayStandardPreview,
          cardData: reactionDisplayStandardData
        },
        ...(nip30ReactionEvent ? [{
          name: 'Custom Emojis',
          description: 'NIP-30 custom emojis',
          command: 'npx shadcn@latest add reaction',
          preview: displayCustomPreview,
          cardData: reactionDisplayCustomData
        }] : [])
      ]}
    />

    <!-- Blocks Showcase -->
    {#snippet buttonPreview()}
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <span class="text-sm text-muted-foreground w-24">Default:</span>
          <ReactionButton {ndk} event={sampleEvent} />
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-muted-foreground w-24">Fire emoji:</span>
          <ReactionButton {ndk} event={sampleEvent} emoji="🔥" />
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-muted-foreground w-24">No count:</span>
          <ReactionButton {ndk} event={sampleEvent} showCount={false} />
        </div>
      </div>
    {/snippet}

    {#snippet slackPreview()}
      <div class="space-y-8">
        <div>
          <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Horizontal</h4>
          <ReactionSlack {ndk} event={sampleEvent} />
        </div>

        <div>
          <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Vertical</h4>
          <ReactionSlack {ndk} event={sampleEvent} variant="vertical" />
        </div>
      </div>
    {/snippet}

    {#snippet emojiButtonPreview()}
      <ReactionEmojiButtonExample {ndk} event={sampleEvent} />
    {/snippet}

    <ComponentPageSectionTitle
      title="Blocks"
      description="Pre-composed reaction button layouts ready to use."
    />

    <ComponentsShowcaseGrid
      blocks={[
        {
          name: 'ReactionButton',
          description: 'Minimal icon-first design',
          command: 'npx shadcn@latest add reaction-button',
          preview: buttonPreview,
          cardData: reactionButtonData
        },
        {
          name: 'ReactionSlack',
          description: 'Slack-style reactions',
          command: 'npx shadcn@latest add reaction-slack',
          preview: slackPreview,
          cardData: reactionSlackData
        },
        {
          name: 'ReactionEmojiButton',
          description: 'With emoji picker',
          command: 'npx shadcn@latest add reaction-emoji-button',
          preview: emojiButtonPreview,
          cardData: reactionEmojiButtonData
        }
      ]}
    />

    <!-- Custom Implementation Showcase -->
    {#snippet basicActionPreview()}
      <BasicExample {ndk} event={sampleEvent} />
    {/snippet}

    {#snippet slackStylePreview()}
      <SlackLikeExample {ndk} event={sampleEvent} />
    {/snippet}

    {#snippet builderPreview()}
      <BuilderExample {ndk} event={sampleEvent} />
    {/snippet}

    {#snippet delayedPreview()}
      <DelayedExample {ndk} event={sampleEvent} />
    {/snippet}

    <ComponentPageSectionTitle
      title="Custom Implementation"
      description="Use the createReactionAction builder directly."
    />

    <ComponentsShowcaseGrid
      blocks={[
        {
          name: 'Basic',
          description: 'Click to react',
          command: 'npx shadcn@latest add reaction',
          preview: basicActionPreview,
          cardData: basicActionData
        },
        {
          name: 'Slack-Style',
          description: 'All reactions display',
          command: 'npx shadcn@latest add reaction',
          preview: slackStylePreview,
          cardData: slackStyleData
        },
        {
          name: 'Builder',
          description: 'Full control',
          command: 'npx shadcn@latest add reaction',
          preview: builderPreview,
          cardData: builderData
        },
        {
          name: 'Delayed',
          description: 'Cancellable reactions',
          command: 'npx shadcn@latest add reaction',
          preview: delayedPreview,
          cardData: delayedData
        }
      ]}
    />

    <!-- Components Section -->
    <ComponentPageSectionTitle title="Components" description="Explore each variant in detail" />

    <section class="py-12 space-y-16">
      <ComponentCard inline data={reactionDisplayStandardData}>
        {#snippet preview()}
          <ReactionDisplayBasic />
        {/snippet}
      </ComponentCard>

      {#if nip30ReactionEvent}
        <ComponentCard inline data={reactionDisplayCustomData}>
          {#snippet preview()}
            <ReactionDisplayCustom event={nip30ReactionEvent} />
          {/snippet}
        </ComponentCard>
      {/if}

      <ComponentCard inline data={reactionButtonData}>
        {#snippet preview()}
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-4">
              <span class="text-sm text-muted-foreground w-24">Default:</span>
              <ReactionButton {ndk} event={sampleEvent} />
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-muted-foreground w-24">Fire emoji:</span>
              <ReactionButton {ndk} event={sampleEvent} emoji="🔥" />
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-muted-foreground w-24">No count:</span>
              <ReactionButton {ndk} event={sampleEvent} showCount={false} />
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-muted-foreground w-24">Delayed (5s):</span>
              <ReactionButton {ndk} event={sampleEvent} delayed={5} />
              <span class="text-xs text-muted-foreground">← Click twice to cancel</span>
            </div>
          </div>
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={reactionSlackData}>
        {#snippet preview()}
          <div class="space-y-8">
            <div>
              <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Horizontal</h4>
              <ReactionSlack {ndk} event={sampleEvent} />
            </div>

            <div>
              <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Vertical</h4>
              <ReactionSlack {ndk} event={sampleEvent} variant="vertical" />
            </div>

            <div>
              <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">With Delayed Reactions (5s)</h4>
              <ReactionSlack {ndk} event={sampleEvent} delayed={5} />
              <p class="text-xs text-muted-foreground mt-2">💡 Click any reaction twice within 5 seconds to cancel</p>
            </div>
          </div>
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={reactionEmojiButtonData}>
        {#snippet preview()}
          <ReactionEmojiButtonExample {ndk} event={sampleEvent} />
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={basicActionData}>
        {#snippet preview()}
          <BasicExample {ndk} event={sampleEvent} />
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={slackStyleData}>
        {#snippet preview()}
          <SlackLikeExample {ndk} event={sampleEvent} />
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={builderData}>
        {#snippet preview()}
          <BuilderExample {ndk} event={sampleEvent} />
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={delayedData}>
        {#snippet preview()}
          <DelayedExample {ndk} event={sampleEvent} />
        {/snippet}
      </ComponentCard>
    </section>
  {:else}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading event...</div>
    </div>
  {/if}
</div>
