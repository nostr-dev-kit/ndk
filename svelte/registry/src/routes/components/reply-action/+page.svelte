<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createReplyAction } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import CodePreview from '$site-components/code-preview.svelte';

  // Import examples
  import BasicExample from './examples/reply-action-basic.svelte';
  import BasicExampleRaw from './examples/reply-action-basic.svelte?raw';
  import BuilderCountExample from './examples/reply-action-builder-count.svelte';
  import BuilderCountExampleRaw from './examples/reply-action-builder-count.svelte?raw';
  import CountOnlyExample from './examples/reply-action-count-only.svelte';
  import CountOnlyExampleRaw from './examples/reply-action-count-only.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();
  let replyState = $state<ReturnType<typeof createReplyAction> | null>(null);

  $effect(() => {
    ndk.fetchEvent('nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j')
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
  </header>

  {#if sampleEvent && replyState}
    <section class="demo">
      <h2>Basic Usage</h2>
      <CodePreview
        title="Basic ReplyAction"
        description="Click to open reply composer. The button shows the current reply count."
        code={BasicExampleRaw}
      >
        <BasicExample {ndk} event={sampleEvent} content={sampleEvent.content} count={replyState.count} />
      </CodePreview>
    </section>

    <section class="demo">
      <h2>Using the Builder with Count</h2>
      <CodePreview
        title="Custom Implementation with Count"
        description="Build your own reply button showing the count"
        code={BuilderCountExampleRaw}
      >
        <BuilderCountExample {ndk} event={sampleEvent} content={sampleEvent.content} count={replyState.count} />
      </CodePreview>
    </section>

    <section class="demo">
      <h2>Count Only Display</h2>
      <CodePreview
        title="Just Show the Count"
        description="Display reply count without interaction"
        code={CountOnlyExampleRaw}
      >
        <CountOnlyExample {ndk} event={sampleEvent} content={sampleEvent.content} count={replyState.count} />
      </CodePreview>
    </section>
  {:else}
    <section class="demo">
      <p>Loading event...</p>
    </section>
  {/if}
</div>
