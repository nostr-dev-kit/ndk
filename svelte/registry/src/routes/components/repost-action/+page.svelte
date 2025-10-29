<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import CodePreview from '$site-components/code-preview.svelte';

  import BasicExample from '$lib/ndk/actions/examples/repost-action-basic.svelte';
  import BasicExampleRaw from '$lib/ndk/actions/examples/repost-action-basic.svelte?raw';

  import BuilderExample from '$lib/ndk/actions/examples/repost-action-builder.svelte';
  import BuilderExampleRaw from '$lib/ndk/actions/examples/repost-action-builder.svelte?raw';

  import CountOnlyExample from '$lib/ndk/actions/examples/repost-action-count-only.svelte';
  import CountOnlyExampleRaw from '$lib/ndk/actions/examples/repost-action-count-only.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();

  $effect(() => {
    ndk.fetchEvent('nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j')
      .then(event => {
        if (event) sampleEvent = event;
      })
      .catch(err => console.error('Failed to fetch sample event:', err));
  });
</script>

<div class="component-page">
  <header>
    <h1>RepostAction</h1>
    <p>Repost button with count display. Tracks both regular reposts and quote posts.</p>
  </header>

  {#if sampleEvent}
    <section class="demo">
      <h2>Basic Usage</h2>
      <CodePreview
        title="Basic RepostAction"
        description="Simple repost button with automatic count tracking (includes quotes)"
        code={BasicExampleRaw}
      >
        <BasicExample {ndk} event={sampleEvent} />
      </CodePreview>
    </section>

    <section class="demo">
      <h2>Using the Builder with Count</h2>
      <CodePreview
        title="Custom Implementation with Count"
        description="Build your own repost button showing the count"
        code={BuilderExampleRaw}
      >
        <BuilderExample {ndk} event={sampleEvent} />
      </CodePreview>
    </section>

    <section class="demo">
      <h2>Count Only Display</h2>
      <CodePreview
        title="Just Show the Count"
        description="Display repost count without interaction"
        code={CountOnlyExampleRaw}
      >
        <CountOnlyExample {ndk} event={sampleEvent} />
      </CodePreview>
    </section>

    <section class="demo">
      <h2>Features</h2>
      <div class="feature-box">
        <h3>What's Counted</h3>
        <ul>
          <li><strong>Regular reposts:</strong> Kind 6 and Kind 16 events with #e tag</li>
          <li><strong>Quote posts:</strong> Events with #q tag referencing this event</li>
          <li><strong>All combined:</strong> Total shows both types together</li>
        </ul>
      </div>
    </section>
  {:else}
    <section class="demo">
      <p>Loading event...</p>
    </section>
  {/if}
</div>

<style>
  .feature-box {
    background: hsl(var(--color-muted) / 0.3);
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    padding: 1.5rem;
  }

  .feature-box ul {
    margin: 0;
    padding-left: 1.5rem;
    color: hsl(var(--color-foreground));
  }

  .feature-box li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }

  .feature-box strong {
    color: hsl(var(--color-primary));
  }
</style>
