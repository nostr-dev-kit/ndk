<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/ndk/edit-props';
  import CodePreview from '$site-components/code-preview.svelte';

  import BasicExample from './examples/reaction-action-basic.svelte';
  import BasicExampleRaw from './examples/reaction-action-basic.svelte?raw';

  import BuilderExample from './examples/reaction-action-builder.svelte';
  import BuilderExampleRaw from './examples/reaction-action-builder.svelte?raw';

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
    <h1>ReactionAction</h1>
    <p>Simple reaction button with long-press emoji picker and NIP-30/NIP-51 support. Long-press to open emoji picker with custom emojis from your NIP-51 kind:10030 list.</p>

    <EditProps.Root>
      <EditProps.Prop name="Event ID" type="text" bind:value={eventId} />
    </EditProps.Root>
  </header>

  {#if sampleEvent}
    <section class="demo space-y-8">
      <h2 class="text-2xl font-semibold mb-4">Examples</h2>

      <CodePreview
        title="Basic ReactionAction"
        description="Click to react with a heart, long-press to open emoji picker. Shows current reaction count."
        code={BasicExampleRaw}
      >
        <BasicExample {ndk} event={sampleEvent} />
      </CodePreview>

      <CodePreview
        title="Using the Builder"
        description="Use createReactionAction() for full control over your UI markup with reactive state management"
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

<style>
  .demo-description code {
    background: var(--color-muted);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    color: var(--color-primary);
  }
</style>
