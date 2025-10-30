<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/ndk/edit-props';
	import Demo from '$site-components/Demo.svelte';

  import BasicExample from './examples/reaction-action-basic.svelte';
  import BasicExampleRaw from './examples/reaction-action-basic.svelte?raw';

  import SlackLikeExample from './examples/slack-like.svelte';
  import SlackLikeCodeRaw from './examples/slack-like-code.svelte?raw';

  import BuilderExample from './examples/reaction-action-builder.svelte';
  import BuilderExampleRaw from './examples/reaction-action-builder.svelte?raw';

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

<div class="component-page">
  <header>
    <h1>ReactionAction</h1>
    <p>Simple reaction button with long-press emoji picker and NIP-30/NIP-51 support. Long-press to open emoji picker with custom emojis from your NIP-51 kind:10030 list.</p>

    <EditProps.Root>
      <EditProps.Prop name="Sample Event" type="event" bind:value={sampleEvent} />
    </EditProps.Root>
  </header>

  {#if sampleEvent}
    <section class="demo space-y-8">
      <h2 class="text-2xl font-semibold mb-4">Examples</h2>

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
        description="Use createReactionAction() for full control over your UI markup with reactive state management"
        code={BuilderExampleRaw}
      >
        <BuilderExample {ndk} event={sampleEvent} />
      </Demo>
    </section>
  {:else}
    <section class="demo">
      <p>Loading event...</p>
    </section>
  {/if}
</div>
