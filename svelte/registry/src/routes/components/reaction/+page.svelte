<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/site-components/edit-props';
	import Demo from '$site-components/Demo.svelte';

  // Import block components for preview
  import ReactionButton from '$lib/registry/blocks/reaction-button.svelte';
  import ReactionSlack from '$lib/registry/blocks/reaction-slack.svelte';
  import ReactionEmojiButton from '$lib/registry/blocks/reaction-emoji-button.svelte';

  // Import primitives for examples
  import { Reaction } from '$lib/registry/components/reaction';

  // Import primitive examples
  import ReactionDisplayBasic from './examples/reaction-display-basic.svelte';
  import ReactionDisplayBasicRaw from './examples/reaction-display-basic.svelte?raw';
  import ReactionDisplayCustom from './examples/reaction-display-custom.svelte';
  import ReactionDisplayCustomRaw from './examples/reaction-display-custom.svelte?raw';

  // Import code examples
  import MinimalCodeRaw from './examples/minimal-code.svelte?raw';
  import ReactionSlackCodeRaw from './examples/reaction-slack-code.svelte?raw';

  import ReactionEmojiButtonExample from './examples/reaction-emoji-button-code.svelte';
  import ReactionEmojiButtonCodeRaw from './examples/reaction-emoji-button-code.svelte?raw';

  import BasicExample from './examples/reaction-action-basic.svelte';
  import BasicExampleRaw from './examples/reaction-action-basic.svelte?raw';

  import SlackLikeExample from './examples/slack-like.svelte';
  import SlackLikeCodeRaw from './examples/slack-like-code.svelte?raw';

  import BuilderExample from './examples/reaction-action-builder.svelte';
  import BuilderExampleRaw from './examples/reaction-action-builder.svelte?raw';

  import DelayedExample from './examples/delayed.svelte';
  import DelayedCodeRaw from './examples/delayed-code.svelte?raw';

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
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <!-- Header -->
  <div class="mb-12">
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
    <!-- Reaction Primitives Section -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-2">Reaction Primitives</h2>
      <p class="text-muted-foreground mb-8">
        Low-level building blocks for rendering emoji reactions. Use these primitives to create custom reaction UIs.
      </p>

      <div class="space-y-12">
        <Demo
          title="Reaction.Display - Standard Emojis"
          description="Renders standard unicode emojis with configurable size. Perfect for displaying reaction counts and user reactions."
          code={ReactionDisplayBasicRaw}
        >
          <ReactionDisplayBasic />
        </Demo>

        {#if nip30ReactionEvent}
          <Demo
            title="Reaction.Display - Custom Emojis (NIP-30)"
            description="Renders custom emoji images using NIP-30 emoji tags. Automatically handles both standard and custom emojis."
            code={ReactionDisplayCustomRaw}
          >
            <ReactionDisplayCustom event={nip30ReactionEvent} />
          </Demo>
        {/if}
      </div>
    </section>

    <!-- Blocks Section -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-2">Blocks</h2>
      <p class="text-muted-foreground mb-8">
        Pre-composed reaction button layouts ready to use. Install with a single command.
      </p>

      <div class="space-y-12">
        <Demo
          title="ReactionButton"
          description="Minimal icon-first design. Best for inline use in feeds or alongside other action buttons. Click to react with a heart."
          component="reaction-button"
          code={MinimalCodeRaw}
        >
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
        </Demo>

        <Demo
          title="ReactionSlack"
          description="Slack-style reactions with horizontal and vertical layouts. Horizontal shows avatars in popover on hover. Vertical shows avatars inline. Best for displaying all reactions with user attribution."
          component="reaction-slack"
          code={ReactionSlackCodeRaw}
        >
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
        </Demo>

        <Demo
          title="ReactionEmojiButton"
          description="Reaction button with emoji picker popover. Click to open emoji picker and select from your custom emojis and defaults. Uses bits-ui Popover component. Supports custom trigger via children."
          component="reaction-emoji-button"
          code={ReactionEmojiButtonCodeRaw}
        >
          <ReactionEmojiButtonExample {ndk} event={sampleEvent} />
        </Demo>
      </div>
    </section>

    <!-- Examples Section -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-2">Custom Implementation</h2>
      <p class="text-muted-foreground mb-8">
        Use the createReactionAction builder directly to create custom reaction buttons.
      </p>

      <div class="space-y-12">
        <Demo
          title="Basic ReactionAction"
          description="Click to react with a heart, long-press to open emoji picker. Shows current reaction count."
          code={BasicExampleRaw}
        >
          <BasicExample {ndk} event={sampleEvent} />
        </Demo>

        <Demo
          title="Slack-Style Reactions"
          description="Display all reactions sorted by count. Hover to see who reacted with each emoji. Click to add/remove your reaction. Uses allReactions map from the builder."
          code={SlackLikeCodeRaw}
        >
          <SlackLikeExample {ndk} event={sampleEvent} />
        </Demo>

        <Demo
          title="Using the Builder"
          description="Use createReactionAction() for full control over your UI markup with reactive state management."
          code={BuilderExampleRaw}
        >
          <BuilderExample {ndk} event={sampleEvent} />
        </Demo>

        <Demo
          title="Cancellable Delayed Reactions"
          description="Set delayed: 5 to show reactions immediately (optimistic update) but wait 5 seconds before publishing. Click again to cancel."
          code={DelayedCodeRaw}
        >
          <DelayedExample {ndk} event={sampleEvent} />
        </Demo>
      </div>
    </section>
  {:else}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading event...</div>
    </div>
  {/if}
</div>
