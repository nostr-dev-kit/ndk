<script lang="ts">
  import BlockDetailHeader from '$site-components/blocks/BlockDetailHeader.svelte';
  import BlockInstallSection from '$site-components/blocks/BlockInstallSection.svelte';
  import BlockVariantCard from '$site-components/blocks/BlockVariantCard.svelte';
  import BlockPropsTable from '$site-components/blocks/BlockPropsTable.svelte';
</script>

<div class="block-detail">
  <BlockDetailHeader
    title="Timeline Feeds"
    description="Infinite scroll feeds with real-time updates, filtering, and multiple layout options. Build Twitter-like, Instagram-like, or custom feed experiences in minutes."
    icon="📰"
    iconGradient="linear-gradient(135deg, #f55d6c 0%, #ff6482 100%)"
    badges={[
      { label: 'Kind 1' },
      { label: 'NIP-01', variant: 'nip' },
      { label: 'Medium Complexity' },
      { label: '5 variants' }
    ]}
  >
    <button class="install-button">Add to Project</button>
    <a href="#" class="secondary-button">View on GitHub</a>
  </BlockDetailHeader>

  <BlockInstallSection command="npx ndk-svelte add timeline-feed" />

  <!-- Variants Section -->
  <section class="variants-section">
    <h2>Variants</h2>
    <p class="section-description">
      Choose from pre-built variants or compose your own using the builder API.
    </p>

    <!-- Variant Card Placeholder -->
    <div class="variant-card">
      <div class="variant-header">
        <h3>TimelineFeed (Default)</h3>
        <p>Classic Twitter-style feed with avatars, usernames, and action buttons. Best for general-purpose social feeds.</p>
      </div>

      <div class="variant-preview">
        <div class="preview-placeholder">
          <p>Preview goes here</p>
          <p class="preview-hint">Replace with actual component preview</p>
        </div>
      </div>

      <div class="variant-tabs">
        <button class="variant-tab active">Code</button>
        <button class="variant-tab">Props</button>
      </div>

      <div class="variant-code">
        <pre><code>{'<'}TimelineFeed
  {'{'}ndk{'}'}
  filter={{ kinds: [1] }}
  limit={50}
  enableRealtime={true}
/{'>'}</code></pre>
      </div>
    </div>

    <!-- Add more variant cards as needed -->
  </section>

  <!-- Component API Section -->
  <section class="api-section">
    <h2>Component API</h2>

    <table class="props-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>ndk</code></td>
          <td><code>NDKSvelte</code></td>
          <td>—</td>
          <td>NDK instance (optional if provided via context)</td>
        </tr>
        <tr>
          <td><code>filter</code> <span class="required-tag">required</span></td>
          <td><code>NDKFilter</code></td>
          <td>—</td>
          <td>Filter for events to display</td>
        </tr>
        <tr>
          <td><code>limit</code></td>
          <td><code>number</code></td>
          <td><code>50</code></td>
          <td>Initial number of events to load</td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- Builder API Section -->
  <section class="builder-section">
    <h2>Builder API</h2>
    <p class="section-description">
      Use the <code>createTimelineFeed</code> builder for full control over feed behavior.
    </p>

    <div class="variant-code">
      <pre><code>import {'{'} createTimelineFeed {'}'} from '@nostr-dev-kit/svelte';

const feed = createTimelineFeed(() => ({'{'}
  filter: {'{'} kinds: [1], limit: 50 {'}'},
  enableRealtime: true
{'}'}), ndk);

// Access reactive state
feed.events       // $state array of NDKEvent[]
feed.isLoading    // $state boolean
feed.hasMore      // $state boolean

// Methods
await feed.loadMore()
await feed.refresh()</code></pre>
    </div>
  </section>
</div>

<style>
  .block-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  /* Header */
  .header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 2rem;
    align-items: start;
    margin-bottom: 3rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid var(--color-border);
  }

  .header-icon {
    width: 96px;
    height: 96px;
    border-radius: 24px;
    background: linear-gradient(135deg, #f55d6c 0%, #ff6482 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    box-shadow: 0 8px 32px rgba(245, 93, 108, 0.2);
  }

  .header-info h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    letter-spacing: -0.02em;
  }

  .header-info .description {
    font-size: 1.125rem;
    color: var(--color-muted-foreground);
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .header-meta {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .meta-badge {
    padding: 0.375rem 0.875rem;
    background: var(--color-muted);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
  }

  .meta-badge.nip {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
    color: var(--color-primary);
  }

  .header-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .install-button {
    padding: 0.875rem 1.5rem;
    background: var(--color-primary);
    color: var(--primary-foreground);
    border: none;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
  }

  .install-button:hover {
    background: color-mix(in srgb, var(--color-primary) 90%, transparent);
  }

  .secondary-button {
    padding: 0.875rem 1.5rem;
    background: var(--color-muted);
    color: var(--color-foreground);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
    text-decoration: none;
    display: block;
  }

  .secondary-button:hover {
    background: var(--color-accent);
  }

  /* Install Section */
  .install-section {
    background: var(--color-muted);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 3rem;
  }

  .install-section h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .code-block {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1.25rem;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.9rem;
    color: var(--color-foreground);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .copy-button {
    padding: 0.5rem 1rem;
    background: var(--color-muted);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-foreground);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .copy-button:hover {
    background: var(--color-accent);
  }

  /* Sections */
  section {
    margin-bottom: 4rem;
  }

  section h2 {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
  }

  .section-description {
    color: var(--color-muted-foreground);
    margin-bottom: 2rem;
    font-size: 1.05rem;
  }

  /* Variant Card */
  .variant-card {
    background: var(--color-muted);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 2rem;
  }

  .variant-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--color-border);
  }

  .variant-header h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .variant-header p {
    color: var(--color-muted-foreground);
    font-size: 0.95rem;
  }

  .variant-preview {
    padding: 3rem 2rem;
    background: var(--color-background);
    border-bottom: 1px solid var(--color-border);
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-placeholder {
    text-align: center;
    color: var(--color-muted-foreground);
  }

  .preview-hint {
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  .variant-tabs {
    display: flex;
    gap: 0;
    background: var(--color-muted);
    border-bottom: 1px solid var(--color-border);
  }

  .variant-tab {
    padding: 0.875rem 1.5rem;
    background: transparent;
    border: none;
    color: var(--color-muted-foreground);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .variant-tab:hover {
    color: var(--color-foreground);
    background: var(--color-accent);
  }

  .variant-tab.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
  }

  .variant-code {
    padding: 1.5rem 2rem;
    background: var(--color-background);
    overflow-x: auto;
  }

  .variant-code pre {
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--color-foreground);
    margin: 0;
  }

  .variant-code code {
    font-family: inherit;
  }

  /* Props Table */
  .props-table {
    width: 100%;
    background: var(--color-muted);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    overflow: hidden;
    border-collapse: collapse;
  }

  .props-table th {
    background: var(--color-accent);
    padding: 0.875rem 1.25rem;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 600;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-muted-foreground);
  }

  .props-table td {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--color-border);
    font-size: 0.9rem;
  }

  .props-table tr:last-child td {
    border-bottom: none;
  }

  .props-table code {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.85em;
    color: var(--color-primary);
  }

  .required-tag {
    background: color-mix(in srgb, red 20%, transparent);
    color: red;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    margin-left: 0.5rem;
  }

  @media (max-width: 968px) {
    .header {
      grid-template-columns: 1fr;
    }

    .header-actions {
      flex-direction: row;
    }

    .header-info h1 {
      font-size: 2rem;
    }
  }
</style>
