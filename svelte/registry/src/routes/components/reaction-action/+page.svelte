<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/components/ndk/edit-props';
	import Demo from '$site-components/Demo.svelte';

  // Import block components for preview
  import { ReactionButton, ReactionSlack } from '$lib/components/ndk/blocks';

  // Import code examples
  import MinimalCodeRaw from './examples/minimal-code.svelte?raw';
  import ReactionSlackCodeRaw from './examples/reaction-slack-code.svelte?raw';

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
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <!-- Header -->
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-4">ReactionAction</h1>
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
    </EditProps.Root>
  </div>

  {#if sampleEvent}
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
          </div>
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
