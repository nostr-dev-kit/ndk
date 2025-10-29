<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import CodePreview from '$site-components/code-preview.svelte';

  import BasicExample from '$lib/ndk/actions/examples/zap-action-basic.svelte';
  import BasicExampleRaw from '$lib/ndk/actions/examples/zap-action-basic.svelte?raw';

  import CustomAmountExample from '$lib/ndk/actions/examples/zap-action-custom-amount.svelte';
  import CustomAmountExampleRaw from '$lib/ndk/actions/examples/zap-action-custom-amount.svelte?raw';

  import BuilderExample from '$lib/ndk/actions/examples/zap-action-builder.svelte';
  import BuilderExampleRaw from '$lib/ndk/actions/examples/zap-action-builder.svelte?raw';

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
    <h1>ZapAction</h1>
    <p>Zap (lightning payment) button with amount display.</p>
  </header>

  {#if sampleEvent}
    <section class="demo">
      <CodePreview
        title="Basic Usage"
        description="Simple zap button with automatic amount tracking"
        code={BasicExampleRaw}
      >
        <BasicExample {ndk} event={sampleEvent} />
      </CodePreview>
    </section>

    <section class="demo">
      <CodePreview
        title="Custom Amount"
        description="Specify a custom zap amount in satoshis"
        code={CustomAmountExampleRaw}
      >
        <CustomAmountExample {ndk} event={sampleEvent} />
      </CodePreview>
    </section>

    <section class="demo">
      <CodePreview
        title="Using the Builder"
        description="Create custom zap UI using the builder pattern"
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
