<script lang="ts">
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import PageTitle from '$site-components/PageTitle.svelte';
  import { deterministicPubkeyGradient } from '@nostr-dev-kit/svelte';
  import { kindLabel } from '$lib/registry/utils/kind-label';
  import "$lib/site/styles/docs-page.css";

  // Import code examples
  import gradientImport from './examples/gradient-import.example?raw';
  import gradientUsage from './examples/gradient-usage.example?raw';
  import kindLabelImport from './examples/kind-label-import.example?raw';
  import kindLabelUsage from './examples/kind-label-usage.example?raw';
  import kindLabelPractical from './examples/kind-label-practical.example?raw';

  // Sample pubkeys to demonstrate different gradients
  const samplePubkeys = [
    { name: 'Pablo', pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52' },
    { name: 'Fiatjaf', pubkey: '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d' },
    { name: 'Jack', pubkey: '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2' },
    { name: 'Lyn', pubkey: 'eab0e756d32b80bcd464f3d844b8040303075a13eabc3599a762c9ac7ab91f4f' },
    { name: 'Derek', pubkey: '3f770d65d3a764a9c5cb503ae123e62ec7598ad035d836e2a810f3877a745b24' },
  ];

  // Sample kinds to demonstrate kindLabel
  const sampleKinds = [
    { kind: 1, description: 'Short text note' },
    { kind: 30023, description: 'Long-form article' },
    { kind: 6, description: 'Repost' },
    { kind: 7, description: 'Reaction' },
    { kind: 9735, description: 'Zap receipt' },
    { kind: 10002, description: 'Relay list metadata' },
    { kind: 30000, description: 'Categorized people list' },
    { kind: 99999, description: 'Unknown/custom kind' },
  ];
</script>

<PageTitle
  title="Utilities"
  subtitle="Helpful utility functions for working with Nostr data"
/>

<div class="docs-page">

  <section>
    <h2>deterministicPubkeyGradient</h2>
    <p>
      Generate a deterministic gradient based on the first 6 characters of a pubkey.
      Perfect for user avatars, banners, and backgrounds when images are unavailable.
    </p>
  </section>

  <section>
    <h3>Installation</h3>
    <CodeBlock lang="typescript" code={gradientImport} />
  </section>

  <section>
    <h3>Usage</h3>
    <CodeBlock lang="typescript" code={gradientUsage} />
  </section>

  <section>
    <h3>Examples</h3>
    <p>
      Each pubkey generates a unique, consistent gradient based on its first 6 characters:
    </p>

    <div class="examples-grid">
      {#each samplePubkeys as { name, pubkey } (pubkey)}
        <div class="example-card">
          <div
            class="gradient-preview"
            style="background: {deterministicPubkeyGradient(pubkey)}"
          ></div>
          <div class="example-info">
            <div class="example-name">{name}</div>
            <div class="example-pubkey">
              {pubkey.slice(0, 8)}...
            </div>
            <div class="example-color">
              Color: #{pubkey.slice(0, 6)}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section>
    <h3>How it works</h3>
    <ol>
      <li>Takes the first 6 characters of the pubkey as a hex color (e.g., <code>#abc123</code>)</li>
      <li>Converts to HSL color space</li>
      <li>Generates a second color by slightly rotating the hue (+30°) and adjusting lightness (+10%)</li>
      <li>Returns a CSS gradient string combining both colors</li>
    </ol>
  </section>

  <section>
    <h3>Use Cases</h3>
    <div class="use-cases-grid">
      <div class="use-case">
        <div class="use-case-title">Profile Banners</div>
        <div class="use-case-description">
          Show a gradient while banner images load or when users haven't set a banner
        </div>
      </div>
      <div class="use-case">
        <div class="use-case-title">Avatar Fallbacks</div>
        <div class="use-case-description">
          Display a unique gradient when profile pictures are unavailable
        </div>
      </div>
      <div class="use-case">
        <div class="use-case-title">Card Backgrounds</div>
        <div class="use-case-description">
          Create visually distinct user cards without loading images
        </div>
      </div>
      <div class="use-case">
        <div class="use-case-title">Loading States</div>
        <div class="use-case-description">
          Provide visual feedback while content loads
        </div>
      </div>
    </div>
  </section>

  <hr class="my-16" />

  <section>
    <h2>kindLabel</h2>
    <p>
      Convert Nostr event kind numbers to human-readable labels with automatic pluralization support.
      Makes it easy to display event types in your UI without memorizing kind numbers.
    </p>
  </section>

  <section>
    <h3>Installation</h3>
    <CodeBlock lang="typescript" code={kindLabelImport} />
  </section>

  <section>
    <h3>Usage</h3>
    <CodeBlock lang="typescript" code={kindLabelUsage} />
  </section>

  <section>
    <h3>Examples</h3>
    <p>
      Common Nostr event kinds and their labels:
    </p>

    <div class="kind-examples">
      {#each sampleKinds as { kind, description } (kind)}
        <div class="kind-example">
          <div class="kind-header">
            <code class="kind-number">Kind {kind}</code>
            <span class="kind-description">{description}</span>
          </div>
          <div class="kind-labels">
            <div class="kind-label-item">
              <span class="label-type">Singular:</span>
              <span class="label-value">{kindLabel(kind)}</span>
            </div>
            <div class="kind-label-item">
              <span class="label-type">Plural:</span>
              <span class="label-value">{kindLabel(kind, 2)}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section>
    <h3>Supported Kinds</h3>
    <p>
      The function supports all common Nostr kinds from various NIPs:
    </p>
    <ul>
      <li><strong>NIP-01:</strong> Metadata (0), Notes (1), Contact Lists (3), Encrypted Messages (4), Reposts (6), Reactions (7)</li>
      <li><strong>NIP-23:</strong> Long-form Articles (30023)</li>
      <li><strong>NIP-28:</strong> Public Chat (40-44)</li>
      <li><strong>NIP-51:</strong> Lists (10000-10030, 30000-30030)</li>
      <li><strong>NIP-57:</strong> Lightning Zaps (9734, 9735)</li>
      <li><strong>NIP-58:</strong> Badges (30008, 30009)</li>
      <li><strong>NIP-89:</strong> App Metadata (31989, 31990)</li>
      <li><strong>NIP-90:</strong> Data Vending Machines (5000-7000)</li>
      <li><strong>NIP-94:</strong> File Metadata (1063)</li>
      <li><strong>NIP-99:</strong> Classified Listings (30402)</li>
      <li>And more common kinds (1984, 1985, 4550, 9041, 34550...)</li>
    </ul>
    <p class="text-muted-foreground text-sm mt-4">
      Unknown kinds return the kind number as a string (e.g., "99999")
    </p>
  </section>

  <section>
    <h3>Practical Examples</h3>
    <CodeBlock lang="typescript" code={kindLabelPractical} />
  </section>
</div>

<style>
  /* Page-specific styles */
  .examples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .example-card {
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .gradient-preview {
    height: 8rem;
    width: 100%;
  }

  .example-info {
    padding: 1rem;
  }

  .example-name {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .example-pubkey {
    font-size: 0.75rem;
    color: var(--muted-foreground);
    font-family: 'SF Mono', Monaco, monospace;
    word-break: break-all;
  }

  .example-color {
    font-size: 0.75rem;
    color: var(--muted-foreground);
    margin-top: 0.5rem;
  }

  .use-cases-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .use-case {
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .use-case-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .use-case-description {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    line-height: 1.5;
  }

  .kind-examples {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .kind-example {
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .kind-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border);
  }

  .kind-number {
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.875rem;
    font-weight: 600;
    background: var(--muted);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }

  .kind-description {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  .kind-labels {
    display: flex;
    gap: 2rem;
  }

  .kind-label-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .label-type {
    font-size: 0.75rem;
    color: var(--muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .label-value {
    font-weight: 600;
    font-size: 1rem;
  }
</style>
