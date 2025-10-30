<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EditProps } from '$lib/ndk/edit-props';
	import Demo from '$site-components/Demo.svelte';
  import Alert from '$site-components/alert.svelte';

  import BuilderBasic from './examples/builder-basic.svelte';
  import BuilderBasicRaw from './examples/builder-basic.svelte?raw';

  import ComposableParts from './examples/composable-parts.svelte';
  import ComposablePartsRaw from './examples/composable-parts.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let placeholder = $state<string>('Search for users...');
</script>

<div class="component-page">
  <header>
    <h1>UserInput</h1>
    <p>Search and select Nostr users with autocomplete functionality. Searches cached profiles and supports NIP-05/npub/nprofile lookups.</p>

    <EditProps.Root>
      <EditProps.Prop name="Placeholder" type="text" bind:value={placeholder} />
    </EditProps.Root>
  </header>

  <section class="demo space-y-8">
    <h2 class="text-2xl font-semibold mb-4">Examples</h2>

    <Demo
      title="Builder Pattern"
      description="Use createUserInput() for full control over rendering with Svelte 5 runes. Searches cached profiles as you type, with debounced network lookups for NIP-05/npub/nprofile."
      code={BuilderBasicRaw}
    >
      <BuilderBasic {ndk} />
    </Demo>

    <Alert variant="info" title="Builder Features">
      <ul>
        <li><strong>Immediate cache search</strong> - Searches cached profiles as you type</li>
        <li><strong>Debounced network lookup</strong> - NIP-05/npub/nprofile lookups after 300ms</li>
        <li><strong>Prioritizes follows</strong> - Users you follow appear first</li>
        <li><strong>Reactive state</strong> - Uses Svelte 5 runes for optimal reactivity</li>
      </ul>
    </Alert>

    <Demo
      title="Composable Components"
      description="Use pre-built composable components (UserInput.Root, Search, Results, ResultItem) for quick implementation with customizable styling."
      code={ComposablePartsRaw}
    >
      <ComposableParts {ndk} />
    </Demo>

    <Alert variant="info" title="Search Capabilities">
      <p class="mb-2">Supports multiple search methods:</p>
      <ul>
        <li><strong>Name search</strong> - Search by display name or username</li>
        <li><strong>NIP-05</strong> - Enter a Nostr address (e.g., user@domain.com)</li>
        <li><strong>npub</strong> - Paste a public key in npub format</li>
        <li><strong>nprofile</strong> - Paste an nprofile string with relay hints</li>
      </ul>
    </Alert>
  </section>
</div>

<style>
  code {
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    background-color: hsl(var(--color-muted));
    color: hsl(var(--color-foreground));
    font-size: 0.875em;
    font-family: ui-monospace, monospace;
  }
</style>
