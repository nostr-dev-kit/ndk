<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Demo from '$site-components/Demo.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  import Basic from './examples/basic.svelte';
  import BasicRaw from './examples/basic.svelte?raw';
  import CustomItem from './examples/custom-item.svelte';
  import CustomItemRaw from './examples/custom-item.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<svelte:head>
  <title>User Input Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for searching and selecting Nostr users with NIP-05 and npub support." />
</svelte:head>

<div class="component-page">
  <header>
    <div class="header-badge">
      <span class="badge">UI Primitive</span>
      <span class="badge badge-nip">NIP-05</span>
    </div>
    <div class="header-title">
      <h1>User Input</h1>
    </div>
    <p class="header-description">
      Headless, composable primitives for searching and selecting Nostr users. Supports searching by display name, NIP-05 identifier, and npub with debounced lookups and customizable result rendering.
    </p>
    <div class="header-info">
      <div class="info-card">
        <strong>Headless</strong>
        <span>Complete styling freedom</span>
      </div>
      <div class="info-card">
        <strong>NIP-05 & npub</strong>
        <span>Search by identifier or key</span>
      </div>
      <div class="info-card">
        <strong>Debounced</strong>
        <span>Optimized relay queries</span>
      </div>
    </div>
  </header>

  <section class="installation">
    <h2>Installation</h2>
    <pre><code>import &#123; UserInput &#125; from '$lib/registry/ui';</code></pre>
  </section>

  <section class="demo space-y-8">
    <h2>Examples</h2>

    <Demo
      title="Basic Usage"
      description="UserInput provides search functionality with default result item rendering."
      code={BasicRaw}
    >
      <Basic />
    </Demo>

    <Demo
      title="Custom Result Items"
      description="Customize result item rendering using the resultItem snippet with User primitives or your own components."
      code={CustomItemRaw}
    >
      <CustomItem />
    </Demo>
  </section>

  <section class="info">
    <h2>Available Components</h2>
    <div class="components-grid">
      <div class="component-item">
        <code>UserInput.Root</code>
        <p>Context provider with search state management.</p>
      </div>
      <div class="component-item">
        <code>UserInput.Search</code>
        <p>Search input field with loading indicator.</p>
      </div>
      <div class="component-item">
        <code>UserInput.Results</code>
        <p>Results list container with custom item rendering.</p>
      </div>
      <div class="component-item">
        <code>UserInput.ResultItem</code>
        <p>Default result item with avatar and name.</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>UserInput.Root</h2>
    <p class="mb-4">Context provider that manages search state and user selection.</p>
    <ApiTable
      rows={[
        { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance' },
        { name: 'onSelect', type: '(user: NDKUser) => void', default: 'optional', description: 'Callback when user is selected' },
        { name: 'debounceMs', type: 'number', default: '300', description: 'Debounce delay for lookups (ms)' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
        { name: 'children', type: 'Snippet', default: 'required', description: 'Child components' }
      ]}
    />
  </section>

  <section class="info">
    <h2>UserInput.Search</h2>
    <p class="mb-4">Search input field with built-in loading indicator.</p>
    <ApiTable
      rows={[
        { name: 'placeholder', type: 'string', default: "'Search users by name, NIP-05, npub...'", description: 'Input placeholder text' },
        { name: 'autofocus', type: 'boolean', default: 'false', description: 'Whether to autofocus the input' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>UserInput.Results</h2>
    <p class="mb-4">Results list container that displays search results.</p>
    <ApiTable
      rows={[
        { name: 'resultItem', type: 'Snippet<[NDKUser]>', default: 'required', description: 'Snippet for rendering each result item' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>UserInput.ResultItem</h2>
    <p class="mb-4">Default result item component displaying user avatar, name, and NIP-05.</p>
    <ApiTable
      rows={[
        { name: 'user', type: 'NDKUser', default: 'required', description: 'User to display' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Search Capabilities</h2>
    <p class="mb-4">UserInput automatically detects and searches based on query type:</p>
    <div class="search-types-grid">
      <div class="search-type-item">
        <strong>Display Name</strong>
        <p>Searches user profile names (e.g., "alice", "bob")</p>
      </div>
      <div class="search-type-item">
        <strong>NIP-05</strong>
        <p>Looks up users by NIP-05 identifier (e.g., "alice@example.com")</p>
      </div>
      <div class="search-type-item">
        <strong>npub</strong>
        <p>Direct lookup by npub/nprofile (e.g., "npub1...")</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>Debouncing</h2>
    <p class="mb-4">UserInput debounces search queries to avoid excessive relay requests:</p>
    <pre><code>// Default 300ms debounce
&lt;UserInput.Root &#123;ndk&#125; onSelect=&#123;handleSelect&#125;&gt;

// Custom debounce delay
&lt;UserInput.Root &#123;ndk&#125; onSelect=&#123;handleSelect&#125; debounceMs=&#123;500&#125;&gt;</code></pre>
    <p class="mb-4">This prevents rapid-fire requests while typing and improves performance.</p>
  </section>

  <section class="info">
    <h2>Custom Result Items</h2>
    <p class="mb-4">Customize how results are displayed using the resultItem snippet:</p>
    <pre><code>&lt;UserInput.Results&gt;
  &#123;#snippet resultItem(user)&#125;
    &lt;div class="custom-item"&gt;
      &lt;User.Avatar &#123;ndk&#125; &#123;user&#125; size=&#123;40&#125; /&gt;
      &lt;div&gt;
        &lt;div class="name"&gt;&#123;user.profile?.name&#125;&lt;/div&gt;
        &lt;div class="nip05"&gt;&#123;user.profile?.nip05&#125;&lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &#123;/snippet&#125;
&lt;/UserInput.Results&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Context Access</h2>
    <p class="mb-4">Access UserInput context in custom components:</p>
    <pre><code>import &#123; getContext &#125; from 'svelte';
import &#123; type UserInputContext, USER_INPUT_CONTEXT_KEY &#125; from '$lib/registry/ui/user-input';

const context = getContext&lt;UserInputContext&gt;(USER_INPUT_CONTEXT_KEY);

// Available properties:
context.ndk           // NDKSvelte instance
context.query         // Current search query (string)
context.setQuery()    // Update query
context.results       // NDKUser[] search results
context.selectedUser  // Currently selected NDKUser | null
context.selectUser()  // Select a user
context.clear()       // Clear search and selection
context.loading       // boolean loading state
context.onSelect      // Selection callback</code></pre>
  </section>

  <section class="info">
    <h2>Loading State</h2>
    <p class="mb-4">UserInput.Search automatically displays a loading spinner during searches. Access the loading state in custom components:</p>
    <pre><code>const context = getContext&lt;UserInputContext&gt;(USER_INPUT_CONTEXT_KEY);

&#123;#if context.loading&#125;
  &lt;div&gt;Searching...&lt;/div&gt;
&#123;/if&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Selection Handling</h2>
    <p class="mb-4">Handle user selection with the onSelect callback:</p>
    <pre><code>import type &#123; NDKUser &#125; from '@nostr-dev-kit/ndk';

let selectedUser = $state&lt;NDKUser | null&gt;(null);

function handleSelect(user: NDKUser) &#123;
  selectedUser = user;
  console.log('Selected:', user.npub);
  console.log('Profile:', user.profile);
&#125;

&lt;UserInput.Root &#123;ndk&#125; onSelect=&#123;handleSelect&#125;&gt;
  &lt;!-- ... --&gt;
&lt;/UserInput.Root&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Builder Access</h2>
    <p class="mb-4">For advanced use cases, use the underlying builder directly:</p>
    <pre><code>import &#123; createUserInput &#125; from '@nostr-dev-kit/svelte';

let query = $state('');

const userInput = createUserInput(() => (&#123;
  query,
  onSelect: (user) => console.log(user),
  debounceMs: 300
&#125;), ndk);

// Access reactive properties:
userInput.results       // NDKUser[]
userInput.loading       // boolean
userInput.selectedUser  // NDKUser | null
userInput.selectUser()  // Function
userInput.clear()       // Function</code></pre>
  </section>

  <section class="info">
    <h2>Related</h2>
    <div class="related-grid">
      <a href="/ui/user" class="related-card">
        <strong>User Primitives</strong>
        <span>For displaying user information</span>
      </a>
      <a href="/components/user-card" class="related-card">
        <strong>User Card Component</strong>
        <span>Styled user profile cards</span>
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
    background: var(--color-muted);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-muted-foreground);
  }

  .badge-nip {
    background: var(--color-primary);
    color: white;
  }

  .header-title h1 {
    font-size: 3rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 70%, transparent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-description {
    font-size: 1.125rem;
    line-height: 1.7;
    color: var(--color-muted-foreground);
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
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
  }

  .info-card strong {
    font-weight: 600;
    color: var(--color-foreground);
  }

  .info-card span {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
  }

  .installation h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .installation pre {
    padding: 1rem;
    background: var(--color-muted);
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
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
  }

  .component-item code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-primary);
    display: block;
    margin-bottom: 0.5rem;
  }

  .component-item p {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
    margin: 0;
  }

  .search-types-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .search-type-item {
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
  }

  .search-type-item strong {
    font-weight: 600;
    color: var(--color-primary);
    display: block;
    margin-bottom: 0.25rem;
  }

  .search-type-item p {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
    margin: 0;
    line-height: 1.5;
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
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    text-decoration: none;
    transition: all 0.2s;
  }

  .related-card:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
  }

  .related-card strong {
    font-weight: 600;
    color: var(--color-foreground);
  }

  .related-card span {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
  }

  pre {
    margin: 1rem 0;
    padding: 1rem;
    background: var(--color-muted);
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  pre code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
  }
</style>
