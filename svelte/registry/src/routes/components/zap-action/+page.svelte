<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/ndk/edit-props';
  import CodePreview from '$site-components/code-preview.svelte';

  import BasicExample from './examples/zap-action-basic.svelte';
  import BasicExampleRaw from './examples/zap-action-basic.svelte?raw';

  import BuilderExample from './examples/zap-action-builder.svelte';
  import BuilderExampleRaw from './examples/zap-action-builder.svelte?raw';

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
    <h1>ZapAction</h1>
    <p>Zap (lightning payment) button with amount display.</p>

    <EditProps.Root>
      <EditProps.Prop name="Event ID" type="text" bind:value={eventId} />
    </EditProps.Root>
  </header>

  {#if sampleEvent}
    <section class="demo space-y-8">
      <h2 class="text-2xl font-semibold mb-4">Examples</h2>

      <CodePreview
        title="Basic Usage"
        description="Simple zap button with automatic amount tracking"
        code={BasicExampleRaw}
      >
        <BasicExample {ndk} event={sampleEvent} />
      </CodePreview>

      <CodePreview
        title="Using the Builder"
        description="Create custom zap UI using createZapAction() for full control"
        code={BuilderExampleRaw}
      >
        <BuilderExample {ndk} event={sampleEvent} />
      </CodePreview>
    </section>
  {:else}
    <section class="demo">
      <p>Loading event...</p>
    </section>
  {/if}
</div>
