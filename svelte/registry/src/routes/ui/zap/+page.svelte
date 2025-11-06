<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Demo from '$site-components/Demo.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  import Basic from './examples/basic.example.svelte';
  import BasicRaw from './examples/basic.example.svelte?raw';
  import Styled from './examples/styled.example.svelte';
  import StyledRaw from './examples/styled.example.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<svelte:head>
  <title>Zap Primitives - NDK Svelte</title>
  <meta name="description" content="Headless primitives for displaying Lightning zap information including amount and comment content." />
</svelte:head>

<div class="component-page">
  <header>
    <div class="header-badge">
      <span class="badge">UI Primitive</span>
      <span class="badge badge-nip">NIP-57</span>
    </div>
    <div class="header-title">
      <h1>Zap</h1>
    </div>
    <p class="header-description">
      Headless primitives for displaying Lightning zap information. Simple components for showing zap amounts in satoshis and optional zap comments/messages with full styling control.
    </p>
    <div class="header-info">
      <div class="info-card">
        <strong>Headless</strong>
        <span>Completely unstyled</span>
      </div>
      <div class="info-card">
        <strong>NIP-57 Zaps</strong>
        <span>Lightning payment display</span>
      </div>
      <div class="info-card">
        <strong>Simple API</strong>
        <span>Just amount and content</span>
      </div>
    </div>
  </header>

  <section class="installation">
    <h2>Installation</h2>
    <pre><code>import &#123; ZapAmount, ZapContent &#125; from '$lib/registry/ui/zap';</code></pre>
  </section>

  <section class="demo space-y-8">
    <h2>Examples</h2>

    <Demo
      title="Basic Display"
      description="Display zap amounts and comments using the primitive components."
      code={BasicRaw}
    >
      <Basic />
    </Demo>

    <Demo
      title="Styled Cards"
      description="Build custom zap cards with your own styling."
      code={StyledRaw}
    >
      <Styled />
    </Demo>
  </section>

  <section class="info">
    <h2>Available Components</h2>
    <div class="components-grid">
      <div class="component-item">
        <code>ZapAmount</code>
        <p>Display zap amount in satoshis.</p>
      </div>
      <div class="component-item">
        <code>ZapContent</code>
        <p>Display optional zap comment/message.</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>ZapAmount</h2>
    <p class="mb-4">Displays the zap amount in satoshis.</p>
    <ApiTable
      rows={[
        { name: 'zap', type: 'ProcessedZap', default: 'required', description: 'Processed zap object containing amount and metadata' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>ZapContent</h2>
    <p class="mb-4">Displays the zap comment/message if present. Renders nothing if comment is empty.</p>
    <ApiTable
      rows={[
        { name: 'zap', type: 'ProcessedZap', default: 'required', description: 'Processed zap object containing comment and metadata' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>ProcessedZap</h2>
    <p class="mb-4">Zaps are represented by the ProcessedZap type from NDK Svelte:</p>
    <pre><code>import type &#123; ProcessedZap &#125; from '@nostr-dev-kit/svelte';

interface ProcessedZap &#123;
  amount: number;          // Amount in satoshis
  comment?: string;        // Optional zap comment/message
  sender: &#123;
    pubkey: string;
    profile?: NDKUserProfile;
  &#125;;
  // ... other metadata
&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Basic Usage</h2>
    <p class="mb-4">Display zap amount and content:</p>
    <pre><code>import &#123; ZapAmount, ZapContent &#125; from '$lib/registry/ui/zap';
import type &#123; ProcessedZap &#125; from '@nostr-dev-kit/svelte';

let zap: ProcessedZap = &#123;
  amount: 1000,
  comment: 'Great post!',
  sender: &#123; pubkey: '...' &#125;
&#125;;

&lt;div&gt;
  &lt;ZapAmount &#123;zap&#125; /&gt; sats
  &lt;ZapContent &#123;zap&#125; /&gt;
&lt;/div&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Styling Examples</h2>
    <p class="mb-4">Apply custom styles to create different zap displays:</p>
    <pre><code>&lt;!-- Simple inline --&gt;
&lt;div&gt;
  ⚡ &lt;ZapAmount &#123;zap&#125; class="font-bold text-yellow-600" /&gt; sats
&lt;/div&gt;

&lt;!-- Card layout --&gt;
&lt;div class="zap-card"&gt;
  &lt;div class="zap-header"&gt;
    &lt;ZapAmount &#123;zap&#125; class="text-2xl font-bold" /&gt;
    &lt;span&gt;sats&lt;/span&gt;
  &lt;/div&gt;
  &lt;ZapContent &#123;zap&#125; class="text-gray-600 mt-2" /&gt;
&lt;/div&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Loading Zaps</h2>
    <p class="mb-4">Get processed zaps using NDK Svelte builders:</p>
    <pre><code>import &#123; createZapFeed &#125; from '@nostr-dev-kit/svelte';

// Create zap feed for an event
const zapFeed = createZapFeed(() => (&#123;
  eventId: event.id
&#125;), ndk);

// Access processed zaps
$effect(() => &#123;
  const zaps = zapFeed.zaps; // ProcessedZap[]

  zaps.forEach(zap => &#123;
    console.log(`&#123;zap.amount&#125; sats: &#123;zap.comment&#125;`);
  &#125;);
&#125;);</code></pre>
  </section>

  <section class="info">
    <h2>Zap Lists</h2>
    <p class="mb-4">Display lists of zaps:</p>
    <pre><code>import &#123; ZapAmount, ZapContent &#125; from '$lib/registry/ui/zap';

let zaps: ProcessedZap[] = zapFeed.zaps;

&#123;#each zaps as zap&#125;
  &lt;div class="zap-item"&gt;
    &lt;div class="zap-amount"&gt;
      ⚡ &lt;ZapAmount &#123;zap&#125; /&gt; sats
    &lt;/div&gt;
    &#123;#if zap.comment&#125;
      &lt;ZapContent &#123;zap&#125; class="zap-comment" /&gt;
    &#123;/if&#125;
  &lt;/div&gt;
&#123;/each&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Conditional Rendering</h2>
    <p class="mb-4">ZapContent only renders if a comment exists:</p>
    <pre><code>&lt;!-- This renders nothing if zap.comment is empty --&gt;
&lt;ZapContent &#123;zap&#125; /&gt;

&lt;!-- Manual check if needed --&gt;
&#123;#if zap.comment&#125;
  &lt;div class="comment-wrapper"&gt;
    &lt;ZapContent &#123;zap&#125; /&gt;
  &lt;/div&gt;
&#123;/if&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Amount Formatting</h2>
    <p class="mb-4">ZapAmount displays raw satoshi amounts. Add your own formatting:</p>
    <pre><code>&lt;!-- Simple --&gt;
&lt;ZapAmount &#123;zap&#125; /&gt; sats

&lt;!-- With formatting --&gt;
&lt;span&gt;
  &lt;ZapAmount &#123;zap&#125; class="font-mono" /&gt;
  &lt;span class="text-xs text-gray-500"&gt;sats&lt;/span&gt;
&lt;/span&gt;

&lt;!-- Custom wrapper --&gt;
&#123;@const formattedAmount = zap.amount.toLocaleString()&#125;
&lt;span&gt;&#123;formattedAmount&#125; sats&lt;/span&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Integration with User Primitives</h2>
    <p class="mb-4">Combine with User primitives to show zap senders:</p>
    <pre><code>import &#123; ZapAmount, ZapContent, User &#125; from '$lib/registry/ui/zap';

&#123;#each zaps as zap&#125;
  &lt;div class="zap-with-sender"&gt;
    &lt;User.Root &#123;ndk&#125; pubkey=&#123;zap.sender.pubkey&#125;&gt;
      &lt;User.Avatar class="w-8 h-8" /&gt;
      &lt;User.Name /&gt;
    &lt;/User.Root&gt;

    &lt;div class="zap-details"&gt;
      &lt;ZapAmount &#123;zap&#125; /&gt; sats
      &lt;ZapContent &#123;zap&#125; /&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&#123;/each&#125;</code></pre>
  </section>

  <section class="info">
    <h2>NIP-57 Zaps</h2>
    <p class="mb-4">These primitives display zap data from NIP-57 (Lightning Zaps) events:</p>
    <ul class="ml-6 mb-4 space-y-2">
      <li>Kind 9735 zap receipt events</li>
      <li>Amount extracted from bolt11 invoice</li>
      <li>Optional comment from zap request</li>
      <li>Sender information from zap request</li>
    </ul>
    <p class="mb-4">The ProcessedZap type is created by NDK Svelte's zap builders, which handle all the parsing and validation.</p>
  </section>

  <section class="info">
    <h2>Display-Only Primitives</h2>
    <p class="mb-4">Note: These are display-only primitives. For sending zaps, use:</p>
    <ul class="ml-6 mb-4 space-y-2">
      <li><code>createZapAction</code> builder from the registry</li>
      <li>Zap button components (ZapButton, ZapButtonAvatars)</li>
      <li>NDK's <code>NDKZapper</code> directly</li>
    </ul>
  </section>

  <section class="info">
    <h2>Related</h2>
    <div class="related-grid">
      <a href="/components/zap" class="related-card">
        <strong>Zap Components</strong>
        <span>Pre-built zap action buttons</span>
      </a>
      <a href="/ui/user" class="related-card">
        <strong>User Primitives</strong>
        <span>For displaying zap senders</span>
      </a>
    </div>
  </section>
</div>

<style>
  .component-page {
    max-width: 900px;
  }

  header {
    margin-bottom: 3rem;
  }

  .header-badge {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
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
    margin: 1rem 0 1.5rem 0;
  }

  .header-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }

  .info-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }

  .info-card strong {
    font-weight: 600;
    color: var(--foreground);
  }

  .info-card span {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  .installation h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .installation pre {
    padding: 1rem;
    background: var(--muted);
    border-radius: 0.5rem;
  }

  section {
    margin-bottom: 3rem;
  }

  section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .components-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .component-item {
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }

  .component-item code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--primary);
    display: block;
    margin-bottom: 0.5rem;
  }

  .component-item p {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    margin: 0;
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
  }

  ul li {
    color: var(--muted-foreground);
    line-height: 1.6;
  }

  code {
    font-family: 'Monaco', 'Menlo', monospace;
    background: var(--muted);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }
</style>
