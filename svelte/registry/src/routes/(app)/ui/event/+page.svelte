<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Demo from '$site-components/Demo.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  import Basic from './examples/basic.example.svelte';
  import BasicRaw from './examples/basic.example.svelte?raw';
  import WithClick from './examples/with-click.example.svelte';
  import WithClickRaw from './examples/with-click.example.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<svelte:head>
  <title>Event Primitives - NDK Svelte</title>
  <meta name="description" content="Headless primitives for displaying event metadata and relationships." />
</svelte:head>

<div class="component-page">
  <header>
    <div class="header-badge">
      <span class="badge">UI Primitive</span>
      <span class="badge badge-nip">NIP-10</span>
    </div>
    <div class="header-title">
      <h1>Event</h1>
    </div>
    <p class="header-description">
      Headless primitives for displaying event metadata and relationships. Automatically detects and displays event relationships like replies, with support for NIP-10 reply markers.
    </p>
    <div class="header-info">
      <div class="info-card">
        <strong>Headless</strong>
        <span>Unstyled, fully customizable</span>
      </div>
      <div class="info-card">
        <strong>Auto-detection</strong>
        <span>Automatically detects reply relationships</span>
      </div>
      <div class="info-card">
        <strong>Reactive</strong>
        <span>Fetches referenced events on demand</span>
      </div>
    </div>
  </header>

  <section class="installation">
    <h2>Installation</h2>
    <pre><code>import &#123; Event &#125; from '$lib/registry/ui/embedded-event.svelte';</code></pre>
  </section>

  <section class="demo space-y-8">
    <h2>Examples</h2>

    <Demo
      title="Basic Usage"
      description="Display a reply indicator that automatically detects and shows the user being replied to."
      code={BasicRaw}
    >
      <Basic {ndk} />
    </Demo>

    <Demo
      title="With Click Handler"
      description="Add an onclick handler to navigate to the event being replied to."
      code={WithClickRaw}
    >
      <WithClick {ndk} />
    </Demo>
  </section>

  <section class="info">
    <h2>Event.ReplyIndicator</h2>
    <p class="mb-4">Displays a "Replying to @user" indicator when an event is a reply. Automatically detects reply relationships using NIP-10 markers and fetches the parent event and user profile.</p>
    <ApiTable
      rows={[
        { name: 'ndk', type: 'NDKSvelte', default: 'context', description: 'NDK instance (optional, falls back to context)' },
        { name: 'event', type: 'NDKEvent', default: 'required', description: 'The event to check for reply relationship' },
        { name: 'onclick', type: '(event: NDKEvent) => void', default: 'optional', description: 'Click handler that receives the event being replied to' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
        { name: 'children', type: 'Snippet', default: 'optional', description: 'Custom rendering snippet receiving { event, loading }' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Reply Detection</h2>
    <p class="mb-4">The component automatically detects reply relationships using NIP-10:</p>
    <ol class="ml-6 mb-4 space-y-2 list-decimal">
      <li>Looks for an <code>e</code> tag with <code>reply</code> marker</li>
      <li>Falls back to <code>e</code> tag with <code>root</code> marker</li>
      <li>If only one <code>e</code> tag exists, treats it as a reply</li>
    </ol>
    <pre><code>&#123;
  "kind": 1,
  "content": "This is a reply",
  "tags": [
    ["e", "&lt;parent-event-id&gt;", "&lt;relay-url&gt;", "reply"],
    ["p", "&lt;author-pubkey&gt;"]
  ]
&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Basic Example</h2>
    <p class="mb-4">Display a simple reply indicator:</p>
    <pre><code>&lt;Event.ReplyIndicator &#123;ndk&#125; event=&#123;replyEvent&#125; /&gt;</code></pre>
  </section>

  <section class="info">
    <h2>With Click Handler</h2>
    <p class="mb-4">Handle clicks to navigate to the event being replied to:</p>
    <pre><code>&lt;Event.ReplyIndicator
  &#123;ndk&#125;
  event=&#123;replyEvent&#125;
  onclick=&#123;(event) => navigateToEvent(event)&#125;
/&gt;</code></pre>
    <p class="mb-4">The onclick handler receives the full <code>NDKEvent</code> object being replied to, not just the user's npub.</p>
  </section>

  <section class="info">
    <h2>Custom Rendering</h2>
    <p class="mb-4">Use the children snippet for complete control over rendering:</p>
    <pre><code>&lt;Event.ReplyIndicator &#123;ndk&#125; event=&#123;replyEvent&#125;>
  &#123;#snippet children(&#123; event, loading &#125;)&#125;
    &#123;#if loading&#125;
      &lt;span>Loading...&lt;/span>
    &#123;:else if event&#125;
      &lt;div>
        In response to &#123;event.id.slice(0, 8)&#125;...
      &lt;/div>
    &#123;/if&#125;
  &#123;/snippet&#125;
&lt;/Event.ReplyIndicator></code></pre>
  </section>
</div>
