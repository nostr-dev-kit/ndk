<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import CodePreview from '$site-components/code-preview.svelte';
  import Alert from '$site-components/alert.svelte';
  import FeatureList from '$site-components/feature-list.svelte';

  import BuilderBasic from './examples/builder-basic.svelte';
  import BuilderBasicRaw from './examples/builder-basic.svelte?raw';

  import ComposableParts from './examples/composable-parts.svelte';
  import ComposablePartsRaw from './examples/composable-parts.svelte?raw';

  import WithSelection from './examples/with-selection.svelte';
  import WithSelectionRaw from './examples/with-selection.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<div class="component-page">
  <header>
    <h1>UserInput</h1>
    <p>Search and select Nostr users with autocomplete functionality. Searches cached profiles and supports NIP-05/npub/nprofile lookups.</p>
  </header>

  <section class="demo">
    <h2>Using the Builder (Svelte 5 Runes)</h2>
    <p class="demo-description">
      The <code>createUserInput</code> builder provides reactive search functionality with full control over rendering.
      This example shows how to use Svelte 5 runes ($state, $derived) with the builder API.
    </p>
    <CodePreview
      title="Builder Pattern"
      description="Use createUserInput(() => (config)) with reactive config for maximum flexibility"
      code={BuilderBasicRaw}
    >
      <BuilderBasic {ndk} />
    </CodePreview>

    <Alert variant="info" title="Builder Features">
      <ul>
        <li><strong>Immediate cache search</strong> - Searches cached profiles as you type</li>
        <li><strong>Debounced network lookup</strong> - NIP-05/npub/nprofile lookups after 300ms</li>
        <li><strong>Prioritizes follows</strong> - Users you follow appear first</li>
        <li><strong>Reactive state</strong> - Uses Svelte 5 runes for optimal reactivity</li>
      </ul>
    </Alert>
  </section>

  <section class="demo">
    <h2>Composable Components</h2>
    <p class="demo-description">
      Use pre-built composable components for quick implementation with customizable styling.
    </p>
    <CodePreview
      title="Composable Parts"
      description="Combine UserInput.Root, Search, Results, and ResultItem for a complete solution"
      code={ComposablePartsRaw}
    >
      <ComposableParts {ndk} />
    </CodePreview>

    <Alert variant="info" title="Component Architecture">
      <ul>
        <li><code>UserInput.Root</code> - Provides context and manages state</li>
        <li><code>UserInput.Search</code> - Input field with loading indicator</li>
        <li><code>UserInput.Results</code> - Dropdown container for results</li>
        <li><code>UserInput.ResultItem</code> - Individual result with avatar and info</li>
      </ul>
    </Alert>
  </section>

  <section class="demo">
    <h2>With Selection State</h2>
    <p class="demo-description">
      Show selected user and provide a way to clear the selection.
    </p>
    <CodePreview
      title="Selection Management"
      description="Display selected user and allow clearing the selection"
      code={WithSelectionRaw}
    >
      <WithSelection {ndk} />
    </CodePreview>
  </section>

  <section class="demo">
    <h2>Search Capabilities</h2>
    <p class="demo-description">
      The user input component supports multiple search methods:
    </p>
    <FeatureList items={[
      { title: 'Name search', description: 'Search by display name or username' },
      { title: 'NIP-05', description: 'Enter a Nostr address (e.g., user@domain.com)' },
      { title: 'npub', description: 'Paste a public key in npub format' },
      { title: 'nprofile', description: 'Paste an nprofile string with relay hints' }
    ]} />

    <Alert variant="info" title="Performance">
      <ul>
        <li>Cache searches are <strong>immediate</strong> with no debouncing</li>
        <li>Network lookups are <strong>debounced</strong> (default 300ms)</li>
        <li>Results are sorted with <strong>followed users first</strong></li>
        <li>Supports cache adapters with <code>getProfiles</code> method</li>
      </ul>
    </Alert>
  </section>
</div>

<style>
  code {
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    background-color: hsl(var(--muted));
    color: hsl(var(--foreground));
    font-size: 0.875em;
    font-family: ui-monospace, monospace;
  }
</style>
