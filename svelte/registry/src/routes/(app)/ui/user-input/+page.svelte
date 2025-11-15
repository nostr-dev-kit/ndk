<script lang="ts">
    import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/site/ndk.svelte';
  import { NDKUser } from '@nostr-dev-kit/ndk';
  import UIPrimitivePageTemplate from '$lib/site/templates/UIPrimitivePageTemplate.svelte';
  import Preview from '$site-components/preview.svelte';
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import { UserInput } from '$lib/registry/ui/user-input';

  import Basic from './examples/basic-usage/index.svelte';
  import BasicRaw from './examples/basic-usage/index.txt?raw';
  import CustomItem from './examples/custom-item/index.svelte';
  import CustomItemRaw from './examples/custom-item/index.txt?raw';
  // Mock data for anatomy visualization
  const mockUser1 = new NDKUser({ npub: 'npub1mock1...' });
  mockUser1.profile = { name: 'Alice', nip05: 'alice@example.com' };

  const mockUser2 = new NDKUser({ npub: 'npub1mock2...' });
  mockUser2.profile = { name: 'Bob', nip05: 'bob@nostr.com' };

  const mockResults = [
    { user: mockUser1 },
    { user: mockUser2 }
  ];

  // Page metadata
  const metadata = {
    title: 'User Input',
    description: 'Headless, composable primitives for searching and selecting Nostr users. Supports searching by display name, NIP-05 identifier, and npub with debounced lookups and customizable result rendering.',
    importPath: 'ui/user-input',
    nips: ['05'],
    primitives: [
      {
        name: 'UserInput.Root',
        title: 'UserInput.Root',
        description: 'Context provider that manages search state and user selection. Handles debounced searches across display names, NIP-05 identifiers, and npub/nprofile lookups.',
        apiDocs: [{
          name: 'UserInput.Root',
          description: 'Context provider that manages search state and user selection. Handles debounced searches across display names, NIP-05 identifiers, and npub/nprofile lookups.',
          importPath: '$lib/registry/ui/user-input',
          props: [
            { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance' },
            { name: 'onSelect', type: '(user: NDKUser) => void', default: 'optional', description: 'Callback fired when a user is selected' },
            { name: 'debounceMs', type: 'number', default: '300', description: 'Debounce delay for search lookups (ms)' },
            { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
            { name: 'children', type: 'Snippet', default: 'required', description: 'Child components' }
          ]
        }]
      },
      {
        name: 'UserInput.Search',
        title: 'UserInput.Search',
        description: 'Search input field with built-in loading indicator. Automatically detects query type (name, NIP-05, or npub) and triggers appropriate lookups.',
        apiDocs: [{
          name: 'UserInput.Search',
          description: 'Search input field with built-in loading indicator. Automatically detects query type (name, NIP-05, or npub) and triggers appropriate lookups.',
          importPath: '$lib/registry/ui/user-input',
          props: [
            { name: 'placeholder', type: 'string', default: "'Search users by name, NIP-05, npub...'", description: 'Input placeholder text' },
            { name: 'autofocus', type: 'boolean', default: 'false', description: 'Whether to autofocus the input on mount' },
            { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
          ]
        }]
      },
      {
        name: 'UserInput.Results',
        title: 'UserInput.Results',
        description: 'Results list container that displays search results. Supports custom result rendering via snippets and empty state handling.',
        apiDocs: [{
          name: 'UserInput.Results',
          description: 'Results list container that displays search results. Supports custom result rendering via snippets and empty state handling.',
          importPath: '$lib/registry/ui/user-input',
          props: [
            { name: 'children', type: 'Snippet<[UserInputResult]>', default: 'optional', description: 'Snippet for rendering each result (receives UserInputResult)' },
            { name: 'empty', type: 'Snippet', default: 'optional', description: 'Empty state snippet when no results found' },
            { name: 'maxResults', type: 'number', default: 'undefined', description: 'Maximum number of results to display' },
            { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
          ]
        }]
      },
      {
        name: 'UserInput.Item',
        title: 'UserInput.Item',
        description: 'Headless item primitive following the bits-ui pattern. Handles selection and provides flexible rendering options with automatic prop spreading.',
        apiDocs: [{
          name: 'UserInput.Item',
          description: 'Headless item primitive following the bits-ui pattern. Handles selection and provides flexible rendering options with automatic prop spreading.',
          importPath: '$lib/registry/ui/user-input',
          props: [
            { name: 'result', type: 'UserInputResult', default: 'required', description: 'Result object containing user and metadata' },
            { name: 'child', type: 'Snippet<[{ props, result }]>', default: 'optional', description: 'Custom rendering with merged props (bits-ui pattern)' },
            { name: 'children', type: 'Snippet<[{ result }]>', default: 'optional', description: 'Default children rendering' },
            { name: 'onclick', type: '(e: MouseEvent) => void', default: 'optional', description: 'Custom click handler (merged with selection)' },
            { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
          ]
        }]
      }
    ],
    anatomyLayers: [
      {
        id: 'root',
        label: 'UserInput.Root',
        description: 'Container that manages search state and provides context.',
        props: ['ndk', 'onSelect', 'debounceMs', 'class']
      },
      {
        id: 'search',
        label: 'UserInput.Search',
        description: 'Input field for searching users with loading indicator.',
        props: ['placeholder', 'autofocus', 'class']
      },
      {
        id: 'results',
        label: 'UserInput.Results',
        description: 'Container for displaying search results.',
        props: ['children', 'empty', 'maxResults', 'class']
      },
      {
        id: 'item',
        label: 'UserInput.Item',
        description: 'Individual result item with selection handling.',
        props: ['result', 'child', 'children', 'onclick', 'class']
      }
    ]
  };
</script>

<svelte:head>
  <title>User Input Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for searching and selecting Nostr users with NIP-05 and npub support." />
</svelte:head>

<UIPrimitivePageTemplate {metadata} {ndk}>
  {#snippet topExample()}
    <Preview code={BasicRaw}>
      <Basic />
    </Preview>
  {/snippet}

  {#snippet overview()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Overview</h2>
      <p class="text-lg leading-relaxed text-muted-foreground mb-8">
        User Input primitives provide headless components for searching and selecting Nostr users.
        They support searching by display name, NIP-05 identifier, and npub/nprofile with debounced
        lookups and customizable result rendering.
      </p>

      <h3 class="text-xl font-semibold mt-8 mb-4">When You Need These</h3>
      <p class="leading-relaxed mb-4">
        Use User Input primitives when you need to:
      </p>
      <ul class="ml-6 mb-4 list-disc space-y-2">
        <li class="leading-relaxed">Build user search and selection interfaces</li>
        <li class="leading-relaxed">Create mention pickers for posts and comments</li>
        <li class="leading-relaxed">Implement user autocomplete fields</li>
        <li class="leading-relaxed">Search users by NIP-05, npub, or display name</li>
        <li class="leading-relaxed">Build custom user directories or search interfaces</li>
      </ul>
      <p class="leading-relaxed mt-4 text-muted-foreground">
        These primitives use NDK's <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">createUserInput</code> builder,
        which handles debounced searches and automatic query type detection.
      </p>
    </section>
  {/snippet}

  {#snippet anatomyPreview()}
    <UserInput.Root {ndk}>
      <ComponentAnatomy.Layer id="root" label="UserInput.Root">
        <div class="border border-border rounded-lg p-4 bg-card max-w-md space-y-3">
          <ComponentAnatomy.Layer id="search" label="UserInput.Search">
            <UserInput.Search placeholder="Search users..." class="w-full px-3 py-2 border border-border rounded" />
          </ComponentAnatomy.Layer>
          <ComponentAnatomy.Layer id="results" label="UserInput.Results">
            <UserInput.Results class="border border-border rounded divide-y">
              {#each mockResults as result}
                <ComponentAnatomy.Layer id="item" label="UserInput.Item">
                  <UserInput.Item {result} class="p-3 hover:bg-muted cursor-pointer">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-muted"></div>
                      <div class="flex-1">
                        <div class="font-medium">{result.user.profile?.name}</div>
                        <div class="text-xs text-muted-foreground">{result.user.profile?.nip05}</div>
                      </div>
                    </div>
                  </UserInput.Item>
                </ComponentAnatomy.Layer>
              {/each}
            </UserInput.Results>
          </ComponentAnatomy.Layer>
        </div>
      </ComponentAnatomy.Layer>
    </UserInput.Root>
  {/snippet}

  {#snippet examples()}
    <div>
      <h3 class="text-xl font-semibold mb-3">Custom Result Items</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Customize how results are displayed using UserInput.Item with the bits-ui pattern.
        This example shows custom styling with User primitives for avatars and names.
      </p>
      <Preview
        title="Custom Result Items"
        code={CustomItemRaw}
      >
        <CustomItem />
      </Preview>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Search Capabilities</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        UserInput automatically detects and searches based on query type:
      </p>
      <div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 my-4">
        <div class="p-4 border border-border rounded-lg">
          <strong class="font-semibold text-primary block mb-1">Display Name</strong>
          <p class="text-sm text-muted-foreground">Searches user profile names (e.g., "alice", "bob")</p>
        </div>
        <div class="p-4 border border-border rounded-lg">
          <strong class="font-semibold text-primary block mb-1">NIP-05</strong>
          <p class="text-sm text-muted-foreground">Looks up users by NIP-05 identifier (e.g., "alice@example.com")</p>
        </div>
        <div class="p-4 border border-border rounded-lg">
          <strong class="font-semibold text-primary block mb-1">npub</strong>
          <p class="text-sm text-muted-foreground">Direct lookup by npub/nprofile (e.g., "npub1...")</p>
        </div>
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Debouncing</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        UserInput debounces search queries to avoid excessive relay requests. This prevents rapid-fire
        requests while typing and improves performance.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`<!-- Default 300ms debounce -->
<UserInput.Root {ndk} onSelect={handleSelect}>
  <UserInput.Search />
  <UserInput.Results />
</UserInput.Root>

<!-- Custom debounce delay -->
<UserInput.Root {ndk} onSelect={handleSelect} debounceMs={500}>
  <UserInput.Search />
  <UserInput.Results />
</UserInput.Root>`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Selection Handling</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Handle user selection with the onSelect callback:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import type { NDKUser } from '@nostr-dev-kit/ndk';

let selectedUser = $state<NDKUser | null>(null);

function handleSelect(user: NDKUser) {
  selectedUser = user;
}

<UserInput.Root {ndk} onSelect={handleSelect}>
  <UserInput.Search />
  <UserInput.Results />
</UserInput.Root>`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Bits-UI Pattern</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        UserInput.Item supports the bits-ui pattern for flexible rendering with automatic prop spreading:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`<UserInput.Results>
  {#snippet children(result)}
    <UserInput.Item {result}>
      {#snippet child({ props })}
        <!-- props includes onclick, class, role, etc. -->
        <div {...props} class="custom-item">
          <User.Avatar {ndk} user={result.user} class="w-10 h-10" />
          <div>
            <div class="name">{result.user.profile?.name}</div>
            <div class="nip05">{result.user.profile?.nip05}</div>
          </div>
        </div>
      {/snippet}
    </UserInput.Item>
  {/snippet}
</UserInput.Results>`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Empty State</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Customize the empty state when no results are found:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`<UserInput.Results>
  {#snippet empty()}
    <div class="empty-state">
      <p>No users found</p>
      <p class="text-sm text-muted-foreground">
        Try searching by name, NIP-05, or npub
      </p>
    </div>
  {/snippet}
</UserInput.Results>`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Builder Access</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        For advanced use cases, use the underlying builder directly:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import { createUserInput } from '@nostr-dev-kit/svelte';

let query = $state('');

const userInput = createUserInput(() => ({
  query,
  onSelect: (user) => console.log(user),
  debounceMs: 300
}), ndk);

// Access reactive properties:
userInput.results       // NDKUser[]
userInput.loading       // boolean
userInput.selectedUser  // NDKUser | null
userInput.selectUser()  // Function
userInput.clear()       // Function`}
        />
      </div>
    </div>
  {/snippet}

  {#snippet contextSection()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">UserInputResult Type</h2>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Search results are represented by the UserInputResult type, which contains the user
        and metadata about how the match was found.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import type { UserInputResult } from '@nostr-dev-kit/svelte';

interface UserInputResult {
  user: NDKUser;              // The matched user
  matchType: 'name' | 'nip05' | 'npub';  // How the user was found
  score?: number;             // Optional relevance score
}`}
        />
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">Context Access</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Access UserInput context in custom components:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import { type UserInputContext, USER_INPUT_CONTEXT_KEY } from '$lib/registry/ui/user-input';

const context = getContext<UserInputContext>(USER_INPUT_CONTEXT_KEY);

// Available properties:
context.ndk           // NDKSvelte instance
context.query         // Current search query (string)
context.setQuery()    // Update query
context.results       // NDKUser[] search results
context.selectedUser  // Currently selected NDKUser | null
context.selectUser()  // Select a user
context.clear()       // Clear search and selection
context.loading       // boolean loading state
context.onSelect      // Selection callback`}
        />
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">Loading State</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        UserInput.Search automatically displays a loading spinner during searches.
        Access the loading state in custom components:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`const context = getContext<UserInputContext>(USER_INPUT_CONTEXT_KEY);

{#if context.loading}
  <div>Searching...</div>
{/if}`}
        />
      </div>
    </section>
  {/snippet}

  {#snippet relatedComponents()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Related</h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <a href="/ui/user" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">User Primitives</strong>
          <span class="text-sm text-muted-foreground">For displaying user information</span>
        </a>
        <a href="/components/user-card" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">User Card Component</strong>
          <span class="text-sm text-muted-foreground">Styled user profile cards</span>
        </a>
      </div>
    </section>
  {/snippet}
</UIPrimitivePageTemplate>
