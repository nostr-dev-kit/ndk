<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createZapSendAction } from '$lib/registry/builders/zap-send/index.svelte.js';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { User } from '$lib/registry/ui/user';

  const ndk = getContext<NDKSvelte>('ndk');

  // Sample event with splits for demo
  let sampleEvent = $state<NDKEvent | undefined>();

  $effect(() => {
    (async () => {
      try {
        const event = await ndk.fetchEvent('nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j');
        if (event && !sampleEvent) sampleEvent = event;
      } catch (err) {
        console.error('Failed to fetch sample event:', err);
      }
    })();
  });

  // Create the zap send action
  const zap = $derived(
    sampleEvent
      ? createZapSendAction(() => ({ target: sampleEvent }), ndk)
      : null
  );
</script>

<svelte:head>
  <title>createZapSendAction - Builder | NDK Svelte</title>
  <meta name="description" content="Builder for sending zaps with automatic split calculations and bindable state" />
</svelte:head>

<div class="builder-page">
  <header>
    <div class="header-badge">
      <span class="badge">Builder</span>
      <span class="badge badge-nip">NIP-57</span>
    </div>
    <div class="header-title">
      <h1>createZapSendAction</h1>
    </div>
    <p class="header-description">
      Reactive builder for sending zaps with automatic split calculations. Provides bindable state for amount and comment,
      and automatically calculates zap splits with percentages based on NIP-57 zap tags.
    </p>
  </header>

  <section class="installation">
    <h2>Installation</h2>
    <pre><code>import &#123; createZapSendAction &#125; from '@nostr-dev-kit/svelte';</code></pre>
  </section>

  {#if zap}
    <section class="demo">
      <h2>Interactive Demo</h2>

      <div class="demo-container">
        <div class="zap-window">
          <h3>Send a Zap</h3>

          <!-- Amount input - bindable! -->
          <div class="form-group">
            <label>Amount (sats)</label>
            <div class="amount-controls">
              <button onclick={() => zap.amount = 21} class="preset-btn">
                ⚡ 21
              </button>
              <button onclick={() => zap.amount = 100} class="preset-btn">
                💯 100
              </button>
              <button onclick={() => zap.amount = 1000} class="preset-btn">
                🚀 1K
              </button>
              <input
                type="number"
                bind:value={zap.amount}
                min="1"
                class="amount-input"
              />
            </div>
          </div>

          <!-- Splits display - auto-updates when amount changes -->
          <div class="form-group">
            <label>Recipients ({zap.splits.length})</label>
            <div class="splits-list">
              {#each zap.splits as split}
                <div class="split-item">
                  <User.Root {ndk} pubkey={split.pubkey}>
                    <User.Avatar class="w-10 h-10" />
                    <div class="split-info">
                      <User.Name class="split-name" />
                      <div class="split-amounts">
                        <span class="split-amount">{split.amount} ⚡</span>
                        <span class="split-percentage">
                          ({split.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </User.Root>
                </div>
              {/each}
            </div>
          </div>

          <!-- Comment input - bindable! -->
          <div class="form-group">
            <label>Comment (optional)</label>
            <textarea
              bind:value={zap.comment}
              placeholder="Say something nice..."
              rows="3"
              class="comment-input"
            />
          </div>

          <!-- Send button -->
          <button
            onclick={() => zap.send()}
            disabled={zap.sending}
            class="send-btn"
          >
            {zap.sending ? 'Zapping...' : `⚡ Zap ${zap.amount} sats`}
          </button>

          {#if zap.error}
            <div class="error-message">
              Error: {zap.error.message}
            </div>
          {/if}
        </div>
      </div>
    </section>
  {/if}

  <section class="info">
    <h2>Basic Usage</h2>
    <pre><code>&lt;script&gt;
  import &#123; createZapSendAction &#125; from '@nostr-dev-kit/svelte';

  const zap = createZapSendAction(() => (&#123; target: event &#125;), ndk);
&lt;/script&gt;

&lt;!-- Bind to amount --&gt;
&lt;input type="number" bind:value=&#123;zap.amount&#125; /&gt;

&lt;!-- Splits auto-update when amount changes --&gt;
&#123;#each zap.splits as split&#125;
  &lt;div&gt;&#123;split.amount&#125; sats (&#123;split.percentage&#125;%)&lt;/div&gt;
&#123;/each&#125;

&lt;!-- Bind to comment --&gt;
&lt;textarea bind:value=&#123;zap.comment&#125; /&gt;

&lt;!-- Send button --&gt;
&lt;button onclick=&#123;() => zap.send()&#125; disabled=&#123;zap.sending&#125;&gt;
  &#123;zap.sending ? 'Zapping...' : `Zap $&#123;zap.amount&#125; sats`&#125;
&lt;/button&gt;</code></pre>
  </section>

  <section class="info">
    <h2>API</h2>

    <h3>Return Value</h3>
    <div class="api-table">
      <div class="api-row">
        <code>amount</code>
        <span>number</span>
        <span>Bindable amount in sats (getter/setter)</span>
      </div>
      <div class="api-row">
        <code>comment</code>
        <span>string</span>
        <span>Bindable comment text (getter/setter)</span>
      </div>
      <div class="api-row">
        <code>splits</code>
        <span>ZapSendSplit[]</span>
        <span>Computed splits with amount, percentage, and user</span>
      </div>
      <div class="api-row">
        <code>sending</code>
        <span>boolean</span>
        <span>True when zap is being sent</span>
      </div>
      <div class="api-row">
        <code>error</code>
        <span>Error | null</span>
        <span>Error from last send attempt</span>
      </div>
      <div class="api-row">
        <code>send()</code>
        <span>Promise&lt;void&gt;</span>
        <span>Sends the zap</span>
      </div>
    </div>

    <h3>ZapSendSplit Type</h3>
    <pre><code>interface ZapSendSplit &#123;
  pubkey: string;        // Recipient pubkey
  amount: number;        // Amount in sats (computed from weight)
  percentage: number;    // Percentage of total (computed from weight)
  user: NDKUser;         // NDK user object
&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Features</h2>
    <ul>
      <li><strong>Bindable State</strong> - Use <code>bind:value=&#123;zap.amount&#125;</code> naturally</li>
      <li><strong>Automatic Split Calculation</strong> - Reads NIP-57 zap tags and computes splits with percentages</li>
      <li><strong>Reactive</strong> - Splits recalculate automatically when amount changes</li>
      <li><strong>Efficient</strong> - Caches split weights, only recomputes when target changes</li>
      <li><strong>Status Tracking</strong> - Built-in <code>sending</code> and <code>error</code> states</li>
      <li><strong>Type Safe</strong> - Full TypeScript support with enriched split types</li>
    </ul>
  </section>

  <section class="info">
    <h2>Advanced Example - Custom UI</h2>
    <pre><code>&lt;script&gt;
  const zap = createZapSendAction(() => (&#123; target: event &#125;), ndk);
&lt;/script&gt;

&lt;!-- Slider for amount --&gt;
&lt;input
  type="range"
  bind:value=&#123;zap.amount&#125;
  min="1"
  max="10000"
/&gt;
&lt;p&gt;&#123;zap.amount&#125; sats total&lt;/p&gt;

&lt;!-- Custom split rendering --&gt;
&#123;#each zap.splits as split&#125;
  &lt;div class="recipient-card"&gt;
    &lt;User.Root &#123;ndk&#125; pubkey=&#123;split.pubkey&#125;&gt;
      &lt;User.Avatar size="lg" /&gt;
      &lt;User.Name /&gt;
    &lt;/User.Root&gt;
    &lt;div class="split-details"&gt;
      &lt;span&gt;&#123;split.amount&#125; ⚡&lt;/span&gt;
      &lt;span&gt;&#123;split.percentage.toFixed(1)&#125;%&lt;/span&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&#123;/each&#125;

&lt;!-- Custom send button --&gt;
&lt;button
  onclick=&#123;async () => &#123;
    try &#123;
      await zap.send();
      console.log('Zap sent!');
    &#125; catch (e) &#123;
      console.error('Zap failed:', e);
    &#125;
  &#125;&#125;
&gt;
  Send Zap
&lt;/button&gt;</code></pre>
  </section>

  <section class="info">
    <h2>NIP-57 Split Support</h2>
    <p>
      The builder automatically reads <code>zap</code> tags from events to calculate splits:
    </p>
    <pre><code>// Event with split tags
&#123;
  "kind": 1,
  "content": "...",
  "tags": [
    ["zap", "pubkey1", "1"],  // 33% split
    ["zap", "pubkey2", "2"]   // 66% split
  ]
&#125;

// createZapSendAction automatically:
// 1. Reads the weights (1 and 2)
// 2. Calculates percentages (33% and 66%)
// 3. Distributes amount proportionally</code></pre>
  </section>

  <section class="info">
    <h2>Related</h2>
    <div class="related-grid">
      <a href="/builders/zap-action" class="related-card">
        <strong>createZapAction</strong>
        <span>Read received zaps</span>
      </a>
      <a href="/components/zap" class="related-card">
        <strong>Zap Components</strong>
        <span>Pre-built zap UI</span>
      </a>
    </div>
  </section>
</div>

<style>
  .builder-page {
    max-width: 900px;
  }

  header {
    margin-bottom: 3rem;
  }

  .header-badge {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    background: var(--muted);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--muted-foreground);
  }

  .badge-nip {
    background: var(--primary);
    color: white;
  }

  .header-title h1 {
    font-size: 3rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, transparent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-description {
    font-size: 1.125rem;
    line-height: 1.7;
    color: var(--muted-foreground);
    margin: 1rem 0;
  }

  section {
    margin-bottom: 3rem;
  }

  section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 1.5rem 0 1rem 0;
  }

  .demo-container {
    padding: 2rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background: var(--muted);
  }

  .zap-window {
    max-width: 500px;
    margin: 0 auto;
    padding: 1.5rem;
    background: var(--background);
    border-radius: 0.5rem;
    border: 1px solid var(--border);
  }

  .zap-window h3 {
    margin: 0 0 1.5rem 0;
    font-size: 1.25rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  .amount-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .preset-btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--background);
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .preset-btn:hover {
    background: var(--muted);
    border-color: var(--primary);
  }

  .amount-input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--background);
    font-size: 1rem;
  }

  .splits-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .split-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--background);
  }

  .split-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .split-amounts {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    font-size: 0.875rem;
  }

  .split-amount {
    font-weight: 600;
  }

  .split-percentage {
    color: var(--muted-foreground);
  }

  .comment-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--background);
    font-family: inherit;
    resize: vertical;
  }

  .send-btn {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 0.375rem;
    background: var(--primary);
    color: white;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .send-btn:hover:not(:disabled) {
    opacity: 0.9;
  }

  .send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error-message {
    margin-top: 1rem;
    padding: 0.75rem;
    background: color-mix(in srgb, red 10%, transparent);
    border: 1px solid red;
    border-radius: 0.375rem;
    color: red;
    font-size: 0.875rem;
  }

  .api-table {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .api-row {
    display: grid;
    grid-template-columns: 150px 120px 1fr;
    gap: 1rem;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    align-items: start;
  }

  .api-row code {
    font-family: 'Monaco', 'Menlo', monospace;
    background: var(--muted);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }

  .api-row span:nth-child(2) {
    color: var(--muted-foreground);
    font-size: 0.875rem;
  }

  .api-row span:nth-child(3) {
    color: var(--foreground);
    font-size: 0.875rem;
  }

  pre {
    margin: 1rem 0;
    padding: 1rem;
    background: var(--muted);
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  pre code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
  }

  ul {
    list-style: disc;
    margin-left: 1.5rem;
  }

  ul li {
    color: var(--muted-foreground);
    line-height: 1.8;
    margin-bottom: 0.5rem;
  }

  code {
    font-family: 'Monaco', 'Menlo', monospace;
    background: var(--muted);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .related-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    text-decoration: none;
    transition: all 0.2s;
  }

  .related-card:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }

  .related-card strong {
    font-weight: 600;
    color: var(--foreground);
  }

  .related-card span {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }
</style>
