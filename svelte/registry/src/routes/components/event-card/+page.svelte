<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/ndk/edit-props';
  import CodePreview from '$site-components/code-preview.svelte';

  // Import examples
  import BasicExample from './examples/basic.svelte';
  import BasicExampleRaw from './examples/basic.svelte?raw';
  import CompactExample from './examples/compact.svelte';
  import CompactExampleRaw from './examples/compact.svelte?raw';
  import CustomCompositionExample from './examples/custom-composition.svelte';
  import CustomCompositionExampleRaw from './examples/custom-composition.svelte?raw';
  import InteractiveExample from './examples/interactive.svelte';
  import InteractiveExampleRaw from './examples/interactive.svelte?raw';
  import DropdownExample from './examples/dropdown.svelte';
  import DropdownExampleRaw from './examples/dropdown.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let exampleNote = $state<NDKEvent | undefined>();
</script>

<div class="component-page">
  <header>
    <h1>EventCard</h1>
    <p>Composable event display components for any NDKEvent type.</p>

    <EditProps.Root>
      <EditProps.Prop
        name="Example Event"
        type="event"
        default="nevent1qvzqqqqqqypzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqyxhwumn8ghj7e3h0ghxjme0qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qpqn35mrh4hpc53m3qge6m0exys02lzz9j0sxdj5elwh3hc0e47v3qqpq0a0n"
        bind:value={exampleNote}
      />
    </EditProps.Root>
  </header>

  {#if !exampleNote}
    <div class="loading">Loading real events...</div>
  {:else}
    <section class="demo">
      <CodePreview
        title="Basic EventCard"
        description="A simple event card with header, content, and action buttons."
        code={BasicExampleRaw}
      >
        <BasicExample {ndk} event={exampleNote} />
      </CodePreview>
    </section>

    <section class="demo">
      <CodePreview
        title="Compact Variant"
        description="Minimal header with truncated content."
        code={CompactExampleRaw}
      >
        <CompactExample {ndk} event={exampleNote} />
      </CodePreview>
    </section>

    <section class="demo">
      <CodePreview
        title="Custom Composition"
        description="Full control over component arrangement and styling."
        code={CustomCompositionExampleRaw}
      >
        <CustomCompositionExample {ndk} event={exampleNote} />
      </CodePreview>
    </section>

    <section class="demo">
      <CodePreview
        title="Interactive Card"
        description="Clickable card that navigates to event page."
        code={InteractiveExampleRaw}
      >
        <InteractiveExample {ndk} event={exampleNote} />
      </CodePreview>
    </section>

    <section class="demo">
      <CodePreview
        title="Dropdown Menu"
        description="Self-contained dropdown menu with event options (mute, report, copy, view raw)."
        code={DropdownExampleRaw}
      >
        <DropdownExample {ndk} event={exampleNote} />
      </CodePreview>
    </section>
  {/if}
</div>

