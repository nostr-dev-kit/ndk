<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Demo from '$site-components/Demo.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  import Basic from './examples/basic.example.svelte';
  import BasicRaw from './examples/basic.example.svelte?raw';
  import WithImage from './examples/with-image.example.svelte';
  import WithImageRaw from './examples/with-image.example.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<svelte:head>
  <title>Follow Pack Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for displaying Nostr follow packs (NIP-51 kind:30000) with title, description, image, and member count." />
</svelte:head>

<div class="component-page">
  <header>
    <div class="header-badge">
      <span class="badge">UI Primitive</span>
      <span class="badge badge-nip">NIP-51</span>
    </div>
    <div class="header-title">
      <h1>Follow Pack</h1>
    </div>
    <p class="header-description">
      Headless, composable primitives for displaying Nostr follow packs (NIP-51 kind:30000). Render follow pack metadata including title, description, cover image, and member count with full styling control.
    </p>
    <div class="header-info">
      <div class="info-card">
        <strong>Headless</strong>
        <span>Completely unstyled primitives</span>
      </div>
      <div class="info-card">
        <strong>NIP-51 Follow Packs</strong>
        <span>Kind:30000 curated lists</span>
      </div>
      <div class="info-card">
        <strong>Flexible Display</strong>
        <span>Title, image, description, count</span>
      </div>
    </div>
  </header>

  <section class="installation">
    <h2>Installation</h2>
    <pre><code>import &#123; FollowPack &#125; from '$lib/registry/ui';</code></pre>
  </section>

  <section class="demo space-y-8">
    <h2>Examples</h2>

    <Demo
      title="Basic Display"
      description="Display follow pack metadata with title, description, and member count."
      code={BasicRaw}
    >
      <Basic />
    </Demo>

    <Demo
      title="With Cover Image"
      description="Include the follow pack's cover image for a richer display."
      code={WithImageRaw}
    >
      <WithImage />
    </Demo>
  </section>

  <section class="info">
    <h2>Available Components</h2>
    <div class="components-grid">
      <div class="component-item">
        <code>FollowPack.Root</code>
        <p>Context provider for follow pack primitives.</p>
      </div>
      <div class="component-item">
        <code>FollowPack.Image</code>
        <p>Cover image from follow pack metadata.</p>
      </div>
      <div class="component-item">
        <code>FollowPack.Title</code>
        <p>Follow pack name/title.</p>
      </div>
      <div class="component-item">
        <code>FollowPack.Description</code>
        <p>Follow pack description text.</p>
      </div>
      <div class="component-item">
        <code>FollowPack.MemberCount</code>
        <p>Number of users in the pack.</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>FollowPack.Root</h2>
    <p class="mb-4">Context provider that manages follow pack data and provides it to child components.</p>
    <ApiTable
      rows={[
        { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance' },
        { name: 'followPack', type: 'NDKFollowPack', default: 'required', description: 'Follow pack event instance' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
        { name: 'children', type: 'Snippet', default: 'required', description: 'Child components' }
      ]}
    />
  </section>

  <section class="info">
    <h2>FollowPack.Image</h2>
    <p class="mb-4">Displays the follow pack's cover image.</p>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
        { name: 'fallback', type: 'string', default: 'undefined', description: 'Fallback image URL' }
      ]}
    />
  </section>

  <section class="info">
    <h2>FollowPack.Title</h2>
    <p class="mb-4">Displays the follow pack's name/title.</p>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>FollowPack.Description</h2>
    <p class="mb-4">Displays the follow pack's description text.</p>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>FollowPack.MemberCount</h2>
    <p class="mb-4">Displays the number of members in the follow pack.</p>
    <ApiTable
      rows={[
        { name: 'format', type: "'short' | 'long'", default: "'short'", description: 'Display format ("5" vs "5 members")' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>NDKFollowPack</h2>
    <p class="mb-4">Follow packs are represented by the NDKFollowPack class from NDK:</p>
    <pre><code>import &#123; NDKFollowPack &#125; from '@nostr-dev-kit/ndk';
import type &#123; NDKEvent &#125; from '@nostr-dev-kit/ndk';

// Create from event (kind:30000)
const followPack = NDKFollowPack.from(event);

// Access properties
followPack.title        // Pack name
followPack.description  // Pack description
followPack.image        // Cover image URL
followPack.members      // Array of NDKUser instances</code></pre>
  </section>

  <section class="info">
    <h2>Basic Usage</h2>
    <p class="mb-4">Display follow pack information:</p>
    <pre><code>&lt;FollowPack.Root &#123;ndk&#125; &#123;followPack&#125;&gt;
  &lt;FollowPack.Title /&gt;
  &lt;FollowPack.Description /&gt;
  &lt;FollowPack.MemberCount format="long" /&gt;
&lt;/FollowPack.Root&gt;</code></pre>
  </section>

  <section class="info">
    <h2>With Cover Image</h2>
    <p class="mb-4">Include the follow pack's cover image:</p>
    <pre><code>&lt;FollowPack.Root &#123;ndk&#125; &#123;followPack&#125;&gt;
  &lt;FollowPack.Image class="w-full h-48 object-cover" /&gt;
  &lt;div class="p-4"&gt;
    &lt;FollowPack.Title /&gt;
    &lt;FollowPack.Description /&gt;
  &lt;/div&gt;
&lt;/FollowPack.Root&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Member Count Formats</h2>
    <p class="mb-4">Display member count in different formats:</p>
    <pre><code>&lt;!-- Short format: "42" --&gt;
&lt;FollowPack.MemberCount format="short" /&gt;

&lt;!-- Long format: "42 members" --&gt;
&lt;FollowPack.MemberCount format="long" /&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Loading Follow Packs</h2>
    <p class="mb-4">Load follow packs from Nostr events:</p>
    <pre><code>import &#123; NDKFollowPack &#125; from '@nostr-dev-kit/ndk';
import &#123; NDKKind &#125; from '@nostr-dev-kit/ndk';

// Fetch a specific follow pack
const event = await ndk.fetchEvent(&#123;
  kinds: [NDKKind.FollowPack], // 30000
  authors: [authorPubkey],
  '#d': [packIdentifier]
&#125;);

const followPack = NDKFollowPack.from(event);

// Subscribe to follow packs
const sub = ndk.subscribe(&#123;
  kinds: [NDKKind.FollowPack]
&#125;);

sub.on('event', (event) => &#123;
  const followPack = NDKFollowPack.from(event);
  // Use followPack...
&#125;);</code></pre>
  </section>

  <section class="info">
    <h2>Follow Pack Structure (NIP-51)</h2>
    <p class="mb-4">Follow packs are kind:30000 replaceable events with this structure:</p>
    <pre><code>&#123;
  "kind": 30000,
  "tags": [
    ["d", "&lt;pack-identifier&gt;"],
    ["title", "Amazing Nostr Devs"],
    ["description", "Top developers building on Nostr"],
    ["image", "https://example.com/pack-cover.jpg"],
    ["p", "&lt;pubkey1&gt;"],
    ["p", "&lt;pubkey2&gt;"],
    ["p", "&lt;pubkey3&gt;"]
  ],
  "content": ""
&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Context Access</h2>
    <p class="mb-4">Access follow pack context in custom components:</p>
    <pre><code>import &#123; getContext &#125; from 'svelte';
import &#123; type FollowPackContext, FOLLOW_PACK_CONTEXT_KEY &#125; from '$lib/registry/ui/follow-pack';

const context = getContext&lt;FollowPackContext&gt;(FOLLOW_PACK_CONTEXT_KEY);

// Available properties:
context.ndk         // NDKSvelte instance
context.followPack  // NDKFollowPack instance</code></pre>
  </section>

  <section class="info">
    <h2>Accessing Members</h2>
    <p class="mb-4">Access the follow pack's members:</p>
    <pre><code>import type &#123; NDKUser &#125; from '@nostr-dev-kit/ndk';

const members: NDKUser[] = followPack.members;

// Render member list
&#123;#each members as member&#125;
  &lt;User.Root &#123;ndk&#125; user=&#123;member&#125;&gt;
    &lt;User.Avatar class="w-10 h-10" /&gt;
    &lt;User.Name /&gt;
  &lt;/User.Root&gt;
&#123;/each&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Complete Card Example</h2>
    <p class="mb-4">Build a complete follow pack card:</p>
    <pre><code>&lt;FollowPack.Root &#123;ndk&#125; &#123;followPack&#125;&gt;
  &lt;div class="pack-card"&gt;
    &lt;FollowPack.Image class="cover-image" /&gt;
    &lt;div class="content"&gt;
      &lt;FollowPack.Title class="title" /&gt;
      &lt;FollowPack.Description class="description" /&gt;
      &lt;div class="footer"&gt;
        &lt;FollowPack.MemberCount format="long" /&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/FollowPack.Root&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Styling</h2>
    <p class="mb-4">Apply custom styles to any component:</p>
    <pre><code>&lt;FollowPack.Root &#123;ndk&#125; &#123;followPack&#125; class="custom-root"&gt;
  &lt;FollowPack.Image class="w-full h-48 object-cover rounded-t" /&gt;
  &lt;FollowPack.Title class="text-2xl font-bold" /&gt;
  &lt;FollowPack.Description class="text-gray-600" /&gt;
  &lt;FollowPack.MemberCount class="text-sm" /&gt;
&lt;/FollowPack.Root&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Related</h2>
    <div class="related-grid">
      <a href="/components/follow-pack" class="related-card">
        <strong>Follow Pack Components</strong>
        <span>Pre-styled follow pack cards</span>
      </a>
      <a href="/ui/user" class="related-card">
        <strong>User Primitives</strong>
        <span>For displaying pack members</span>
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

  code {
    font-family: 'Monaco', 'Menlo', monospace;
    background: var(--muted);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }
</style>
