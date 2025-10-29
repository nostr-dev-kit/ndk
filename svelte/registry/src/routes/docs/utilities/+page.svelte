<script lang="ts">
  import { deterministicPubkeyGradient } from '@nostr-dev-kit/svelte';

  // Sample pubkeys to demonstrate different gradients
  const samplePubkeys = [
    { name: 'Pablo', pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52' },
    { name: 'Fiatjaf', pubkey: '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d' },
    { name: 'Jack', pubkey: '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2' },
    { name: 'Lyn', pubkey: 'eab0e756d32b80bcd464f3d844b8040303075a13eabc3599a762c9ac7ab91f4f' },
    { name: 'Derek', pubkey: '3f770d65d3a764a9c5cb503ae123e62ec7598ad035d836e2a810f3877a745b24' },
  ];
</script>

<div class="docs-page">
  <header class="docs-header">
    <h1>Utilities</h1>
    <p class="subtitle">
      Helpful utility functions for working with Nostr data
    </p>
  </header>

  <section>
    <h2>deterministicPubkeyGradient</h2>
    <p>
      Generate a deterministic gradient based on the first 6 characters of a pubkey.
      Perfect for user avatars, banners, and backgrounds when images are unavailable.
    </p>
  </section>

  <section>
    <h3>Installation</h3>
    <pre><code>import &#123; deterministicPubkeyGradient &#125; from '@nostr-dev-kit/svelte';</code></pre>
  </section>

  <section>
    <h3>Usage</h3>
    <pre><code>const gradient = deterministicPubkeyGradient(user.pubkey);
// Returns: 'linear-gradient(135deg, #abc123, hsl(210, 50%, 60%))'

// Use in CSS
&lt;div style="background: &#123;gradient&#125;"&gt;...&lt;/div&gt;</code></pre>
  </section>

  <section>
    <h3>Examples</h3>
    <p>
      Each pubkey generates a unique, consistent gradient based on its first 6 characters:
    </p>

    <div class="examples-grid">
      {#each samplePubkeys as { name, pubkey }}
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
</div>

<style>
  .docs-page {
    max-width: 900px;
  }

  .docs-header {
    margin-bottom: 3rem;
  }

  .docs-header h1 {
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--color-foreground);
    letter-spacing: -0.025em;
  }

  .subtitle {
    font-size: 1.25rem;
    color: var(--color-muted-foreground);
    margin: 0;
  }

  section {
    margin-bottom: 3rem;
  }

  h2 {
    font-size: 1.875rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--color-foreground);
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--color-foreground);
  }

  p {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--color-muted-foreground);
    margin: 0 0 1rem 0;
  }

  ol, ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
    color: var(--color-muted-foreground);
    line-height: 1.7;
  }

  li {
    margin-bottom: 0.5rem;
  }

  pre {
    margin: 1rem 0;
    padding: 1.5rem;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  code {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
    font-size: 0.875rem;
    background: var(--color-muted);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    color: var(--color-foreground);
  }

  pre code {
    background: none;
    padding: 0;
    line-height: 1.7;
    display: block;
  }

  .examples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .example-card {
    border: 1px solid var(--color-border);
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
    color: var(--color-muted-foreground);
    font-family: 'SF Mono', Monaco, monospace;
    word-break: break-all;
  }

  .example-color {
    font-size: 0.75rem;
    color: var(--color-muted-foreground);
    margin-top: 0.5rem;
  }

  .use-cases-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .use-case {
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .use-case-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .use-case-description {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
    line-height: 1.5;
  }
</style>
