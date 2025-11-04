<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { reactionMetadata, reactionDisplayStandardCard, reactionDisplayCustomCard, reactionButtonCard, reactionSlackCard, reactionEmojiButtonCard, reactionActionBasicCard, reactionSlackStyleCard, reactionBuilderCard, reactionDelayedCard } from '$lib/component-registry/reaction';
  import { EditProps } from '$lib/site-components/edit-props';
  import PageTitle from '$lib/site-components/PageTitle.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import type { ShowcaseBlock } from '$lib/templates/types';

  // Import block components
  import { ReactionButton, ReactionSlack, ReactionEmojiButton } from '$lib/registry/components';

  // Import examples
  import ReactionDisplayBasic from './examples/reaction-display-basic.example.svelte';
  import ReactionDisplayCustom from './examples/reaction-display-custom.example.svelte';
  import ReactionEmojiButtonExample from './examples/reaction-emoji-button-code.example.svelte';
  import BasicExample from './examples/reaction-action-basic.example.svelte';
  import SlackLikeExample from './examples/slack-like.example.svelte';
  import BuilderExample from './examples/reaction-action-builder.example.svelte';
  import DelayedExample from './examples/delayed.example.svelte';

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

  // Move const declarations here to avoid TDZ issues with snippets
  const getPrimitivesBlocks = (displayStandardPreview: any, displayCustomPreview: any, hasNip30Event: boolean): ShowcaseBlock[] => [
    {
      name: 'Standard Emojis',
      description: 'Unicode emoji display',
      command: 'npx shadcn@latest add reaction',
      preview: displayStandardPreview,
      cardData: reactionDisplayStandardCard
    },
    ...(hasNip30Event ? [{
      name: 'Custom Emojis',
      description: 'NIP-30 custom emojis',
      command: 'npx shadcn@latest add reaction',
      preview: displayCustomPreview,
      cardData: reactionDisplayCustomCard
    }] : [])
  ];

  const getBlocksBlocks = (buttonPreview: any, slackPreview: any, emojiButtonPreview: any): ShowcaseBlock[] => [
    {
      name: 'ReactionButton',
      description: 'Minimal icon-first design',
      command: 'npx shadcn@latest add reaction-button',
      preview: buttonPreview,
      cardData: reactionButtonCard
    },
    {
      name: 'ReactionSlack',
      description: 'Slack-style reactions',
      command: 'npx shadcn@latest add reaction-slack',
      preview: slackPreview,
      cardData: reactionSlackCard
    },
    {
      name: 'ReactionEmojiButton',
      description: 'With emoji picker',
      command: 'npx shadcn@latest add reaction-emoji-button',
      preview: emojiButtonPreview,
      cardData: reactionEmojiButtonCard
    }
  ];

  const getCustomBlocks = (basicActionPreview: any, slackStylePreview: any, builderPreview: any, delayedPreview: any): ShowcaseBlock[] => [
    {
      name: 'Basic',
      description: 'Click to react',
      command: 'npx shadcn@latest add reaction',
      preview: basicActionPreview,
      cardData: reactionActionBasicCard
    },
    {
      name: 'Slack-Style',
      description: 'All reactions display',
      command: 'npx shadcn@latest add reaction',
      preview: slackStylePreview,
      cardData: reactionSlackStyleCard
    },
    {
      name: 'Builder',
      description: 'Full control',
      command: 'npx shadcn@latest add reaction',
      preview: builderPreview,
      cardData: reactionBuilderCard
    },
    {
      name: 'Delayed',
      description: 'Cancellable reactions',
      command: 'npx shadcn@latest add reaction',
      preview: delayedPreview,
      cardData: reactionDelayedCard
    }
  ];
</script>

{#if sampleEvent}
  <!-- Title section -->
  
  <!-- Reaction Primitives Showcase snippets -->
  {#snippet displayStandardPreview()}
    <ReactionDisplayBasic />
  {/snippet}

  {#snippet displayCustomPreview()}
    {#if nip30ReactionEvent}
      <ReactionDisplayCustom event={nip30ReactionEvent} />
    {/if}
  {/snippet}

  <!-- Blocks Showcase snippets -->
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

  <!-- Custom Implementation Showcase snippets -->
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

  <!-- Component preview snippets -->
  {#snippet displayStandardComponentPreview()}
    <ReactionDisplayBasic />
  {/snippet}

  {#snippet displayCustomComponentPreview()}
    {#if nip30ReactionEvent}
      <ReactionDisplayCustom event={nip30ReactionEvent} />
    {/if}
  {/snippet}

  {#snippet buttonComponentPreview()}
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

  {#snippet slackComponentPreview()}
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

  {#snippet emojiButtonComponentPreview()}
    <ReactionEmojiButtonExample {ndk} event={sampleEvent} />
  {/snippet}

  {#snippet basicActionComponentPreview()}
    <BasicExample {ndk} event={sampleEvent} />
  {/snippet}

  {#snippet slackStyleComponentPreview()}
    <SlackLikeExample {ndk} event={sampleEvent} />
  {/snippet}

  {#snippet builderComponentPreview()}
    <BuilderExample {ndk} event={sampleEvent} />
  {/snippet}

  {#snippet delayedComponentPreview()}
    <DelayedExample {ndk} event={sampleEvent} />
  {/snippet}

  <!-- Custom sections for additional showcase sections -->
  {#snippet customSections()}
    {@const blocksBlocks = getBlocksBlocks(buttonPreview, slackPreview, emojiButtonPreview)}
    {@const customBlocks = getCustomBlocks(basicActionPreview, slackStylePreview, builderPreview, delayedPreview)}

    <!-- Blocks Showcase -->
    <ComponentPageSectionTitle
      title="Blocks"
      description="Pre-composed reaction button layouts ready to use."
    />

    <ComponentsShowcaseGrid blocks={blocksBlocks} />

    <!-- Custom Implementation Showcase -->
    <ComponentPageSectionTitle
      title="Custom Implementation"
      description="Use the createReactionAction builder directly."
    />

    <ComponentsShowcaseGrid blocks={customBlocks} />
  {/snippet}

  {@const primitivesBlocks = getPrimitivesBlocks(displayStandardPreview, displayCustomPreview, !!nip30ReactionEvent)}

  <!-- Use the template -->
  <ComponentPageTemplate
    metadata={reactionMetadata}
    {ndk}
    showcaseBlocks={primitivesBlocks}{customSections}
    componentsSection={{
      cards: reactionMetadata.cards,
      previews: {
        'reaction-display-standard': displayStandardComponentPreview,
        ...(nip30ReactionEvent ? { 'reaction-display-custom': displayCustomComponentPreview } : {}),
        'reaction-button': buttonComponentPreview,
        'reaction-slack': slackComponentPreview,
        'reaction-emoji-button': emojiButtonComponentPreview,
        'reaction-action-basic': basicActionComponentPreview,
        'slack-style': slackStyleComponentPreview,
        'builder-usage': builderComponentPreview,
        'delayed-reactions': delayedComponentPreview
      }
    }}
    apiDocs={reactionMetadata.apiDocs}
  >
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
  </ComponentPageTemplate>
{:else}
  <!-- Loading state -->
  <div class="px-8">
    <PageTitle title={reactionMetadata.title} subtitle={reactionMetadata.description}>
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
    </PageTitle>
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading event...</div>
    </div>
  </div>
{/if}
