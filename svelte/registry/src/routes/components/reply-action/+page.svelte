<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createReplyAction } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/ndk/edit-props';
  import CodePreview from '$site-components/code-preview.svelte';

  // Import examples
  import BasicExample from './examples/reply-action-basic.svelte';
  import BasicExampleRaw from './examples/reply-action-basic.svelte?raw';
  import BuilderCountExample from './examples/reply-action-builder-count.svelte';
  import BuilderCountExampleRaw from './examples/reply-action-builder-count.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let eventId = $state<string>('nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j');
  let sampleEvent = $state<NDKEvent | undefined>();
  let replyState = $state<ReturnType<typeof createReplyAction> | null>(null);

  $effect(() => {
    ndk.fetchEvent(eventId)
      .then(event => {
        if (event) sampleEvent = event;
      })
      .catch(err => console.error('Failed to fetch sample event:', err));
  });

  $effect(() => {
    if (sampleEvent) {
      replyState = createReplyAction(() => ({ event: sampleEvent }), ndk);
    } else {
      replyState = null;
    }
  });
</script>

<div class="component-page">
  <header>
    <h1>ReplyAction</h1>
    <p>Reply button with count display and reply composer.</p>

    <EditProps.Root>
      <EditProps.Prop name="Event ID" type="text" bind:value={eventId} />
    </EditProps.Root>
  </header>

  {#if sampleEvent && replyState}
    <section class="demo space-y-8">
      <h2 class="text-2xl font-semibold mb-4">Examples</h2>

      <CodePreview
        title="Basic ReplyAction"
        description="Click to open reply composer. The button shows the current reply count."
        code={BasicExampleRaw}
      >
        <BasicExample {ndk} event={sampleEvent} content={sampleEvent.content} count={replyState.count} />
      </CodePreview>

      <CodePreview
        title="Using the Builder"
        description="Build your own reply button UI using createReplyAction() for full control"
        code={BuilderCountExampleRaw}
      >
        <BuilderCountExample {ndk} event={sampleEvent} content={sampleEvent.content} count={replyState.count} />
      </CodePreview>
    </section>
  {:else}
    <section class="demo">
      <p>Loading event...</p>
    </section>
  {/if}
</div>
