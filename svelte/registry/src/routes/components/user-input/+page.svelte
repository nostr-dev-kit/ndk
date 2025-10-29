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

    <div class="info-box">
      <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <strong>Builder Features:</strong>
        <ul>
          <li><strong>Immediate cache search</strong> - Searches cached profiles as you type</li>
          <li><strong>Debounced network lookup</strong> - NIP-05/npub/nprofile lookups after 300ms</li>
          <li><strong>Prioritizes follows</strong> - Users you follow appear first</li>
          <li><strong>Reactive state</strong> - Uses Svelte 5 runes for optimal reactivity</li>
        </ul>
      </div>
    </div>
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

    <div class="info-box">
      <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <div>
        <strong>Component Architecture:</strong>
        <ul>
          <li><code>UserInput.Root</code> - Provides context and manages state</li>
          <li><code>UserInput.Search</code> - Input field with loading indicator</li>
          <li><code>UserInput.Results</code> - Dropdown container for results</li>
          <li><code>UserInput.ResultItem</code> - Individual result with avatar and info</li>
        </ul>
      </div>
    </div>
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
    <ul class="feature-list">
      <li><strong>Name search</strong> - Search by display name or username</li>
      <li><strong>NIP-05</strong> - Enter a Nostr address (e.g., user@domain.com)</li>
      <li><strong>npub</strong> - Paste a public key in npub format</li>
      <li><strong>nprofile</strong> - Paste an nprofile string with relay hints</li>
    </ul>

    <div class="info-box">
      <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <div>
        <strong>Performance:</strong>
        <ul>
          <li>Cache searches are <strong>immediate</strong> with no debouncing</li>
          <li>Network lookups are <strong>debounced</strong> (default 300ms)</li>
          <li>Results are sorted with <strong>followed users first</strong></li>
          <li>Supports cache adapters with <code>getProfiles</code> method</li>
        </ul>
      </div>
    </div>
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

  .feature-list {
    margin: 1rem 0;
    padding-left: 1.5rem;
    color: hsl(var(--muted-foreground));
    line-height: 1.8;
  }

  .feature-list li {
    margin-bottom: 0.5rem;
  }

  .feature-list strong {
    color: hsl(var(--foreground));
    font-weight: 600;
  }

  .info-box {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    margin-top: 1.5rem;
    border-radius: 0.5rem;
    background-color: hsl(var(--muted) / 0.5);
    border: 1px solid hsl(var(--border));
  }

  .info-icon {
    width: 1.5rem;
    height: 1.5rem;
    flex-shrink: 0;
    color: hsl(var(--primary));
    margin-top: 0.125rem;
  }

  .info-box ul {
    margin: 0.5rem 0 0;
    padding-left: 1.5rem;
  }

  .info-box li {
    margin-bottom: 0.375rem;
    line-height: 1.5;
  }

  .info-box strong {
    font-weight: 600;
    color: hsl(var(--foreground));
  }
</style>
