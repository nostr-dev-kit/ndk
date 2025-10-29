<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/ndk/edit-props';
  import CodePreview from '$site-components/code-preview.svelte';

  import BasicExample from './examples/repost-action-basic.svelte';
  import BasicExampleRaw from './examples/repost-action-basic.svelte?raw';

  import BuilderExample from './examples/repost-action-builder.svelte';
  import BuilderExampleRaw from './examples/repost-action-builder__code.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let eventId = $state<string>('nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j');
  let sampleEvent = $state<NDKEvent | undefined>();

  $effect(() => {
    ndk.fetchEvent(eventId)
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

    <EditProps.Root>
      <EditProps.Prop name="Event ID" type="text" bind:value={eventId} />
    </EditProps.Root>
  </header>

  {#if sampleEvent}
    <section class="demo space-y-8">
      <h2 class="text-2xl font-semibold mb-4">Examples</h2>

      <CodePreview
        title="Basic RepostAction"
        description="Simple repost button with automatic count tracking (includes quotes)"
        code={BasicExampleRaw}
      >
        <BasicExample {ndk} event={sampleEvent} />
      </CodePreview>

      <CodePreview
        title="Using the Builder"
        description="Build your own repost button UI using createRepostAction() for full control"
        code={BuilderExampleRaw}
      >
        <BuilderExample {ndk} event={sampleEvent} />
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
    background: color-mix(in srgb, var(--color-muted) calc(0.3 * 100%), transparent);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: 1.5rem;
  }

  .feature-box ul {
    margin: 0;
    padding-left: 1.5rem;
    color: var(--color-foreground);
  }

  .feature-box li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }

  .feature-box strong {
    color: var(--color-primary);
  }
</style>
