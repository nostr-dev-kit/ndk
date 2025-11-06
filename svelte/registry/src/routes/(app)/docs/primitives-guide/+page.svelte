<script lang="ts">
  import Alert from '$site-components/alert.svelte';
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import PageTitle from '$site-components/PageTitle.svelte';
  import "$lib/styles/docs-page.css";
</script>

<svelte:head>
  <title>Primitive Patterns Guide - NDK Svelte</title>
  <meta name="description" content="Learn how to create truly headless UI primitives following bits-ui patterns with Svelte 5" />
</svelte:head>

<PageTitle
  title="Primitive Patterns Guide"
  subtitle="Learn how to create truly headless UI primitives following bits-ui patterns with Svelte 5. This guide explains when to use different patterns and how to think about component architecture."
/>

<div class="docs-page">
  <section>
  <Alert>
    <strong>Key Principle:</strong> UI primitives should be completely unstyled and provide maximum flexibility. They manage behavior and state, while users control rendering and styling.
  </Alert>

  <h2>Pattern Categories</h2>

  <p>
    There are three main patterns for UI primitives, each serving different purposes:
  </p>

  <h3>1. Data Provider Pattern (Simple Snippet)</h3>

  <p>
    Use this pattern when your component only needs to expose data or state without controlling DOM behavior.
  </p>

  <h4>When to Use</h4>
  <ul>
    <li>Component provides computed data from context/props</li>
    <li>No event handlers need to be injected</li>
    <li>No ARIA attributes needed</li>
    <li>User has complete control over the markup</li>
  </ul>

  <h4>Example Implementation</h4>

  <CodeBlock language="svelte">
{`<!-- relay-bookmarked-by.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    bookmarks: BookmarkedRelayListState;
    children: Snippet<[{ pubkeys: string[]; count: number }]>;
  }

  let { bookmarks, children }: Props = $props();

  const context = getContext<RelayContext>(RELAY_CONTEXT_KEY);
  if (!context) {
    throw new Error('Must be used within Relay.Root');
  }

  const stats = $derived(bookmarks.getRelayStats(context.relayInfo.url));
  const pubkeys = $derived(stats?.pubkeys || []);
  const count = $derived(stats?.count || 0);
</script>

{#if pubkeys.length > 0}
  {@render children({ pubkeys, count })}
{/if}`}
  </CodeBlock>

  <h4>Usage Example</h4>

  <CodeBlock language="svelte">
{`<Relay.BookmarkedBy {bookmarks}>
  {#snippet children({ pubkeys, count })}
    <div class="flex gap-2">
      <AvatarGroup {pubkeys} />
      <span>{count} bookmarks</span>
    </div>
  {/snippet}
</Relay.BookmarkedBy>`}
  </CodeBlock>

  <h3>2. Behavioral Pattern (Child Snippet)</h3>

  <p>
    Use this pattern when your component needs to inject behavior, event handlers, or ARIA attributes into user-provided elements. This follows the bits-ui <code>child</code> snippet pattern.
  </p>

  <h4>When to Use</h4>
  <ul>
    <li>Component needs to attach event handlers</li>
    <li>Component manages focus or keyboard interactions</li>
    <li>Component needs to inject ARIA attributes</li>
    <li>Component controls element behavior but not appearance</li>
  </ul>

  <h4>Example Implementation</h4>

  <CodeBlock language="svelte">
{`<!-- relay-bookmark-button.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { mergeProps } from '../utils.js';

  interface Props {
    bookmarks: BookmarkedRelayListState;
    class?: string;
    child?: Snippet<[{ props: any; isBookmarked: boolean }]>;
    children?: Snippet<[{ isBookmarked: boolean }]>;
  }

  let {
    bookmarks,
    class: className = '',
    child,
    children,
    ...restProps
  }: Props = $props();

  const isBookmarked = $derived(bookmarks.isBookmarked(url));

  async function handleToggle(e: MouseEvent) {
    e.stopPropagation();
    await bookmarks.toggleBookmark(url);
  }

  const mergedProps = $derived(mergeProps(restProps, {
    onclick: handleToggle,
    disabled: !canToggle,
    'aria-label': isBookmarked ? 'Remove bookmark' : 'Bookmark relay',
    class: className
  }));
</script>

{#if child}
  {@render child({ props: mergedProps, isBookmarked })}
{:else}
  <button {...mergedProps}>
    {#if children}
      {@render children({ isBookmarked })}
    {:else}
      {isBookmarked ? '★' : '☆'}
    {/if}
  </button>
{/if}`}
  </CodeBlock>

  <h4>Usage Examples</h4>

  <CodeBlock language="svelte">
{`<!-- Default button -->
<Relay.BookmarkButton {bookmarks} />

<!-- Custom content -->
<Relay.BookmarkButton {bookmarks}>
  {#snippet children({ isBookmarked })}
    {isBookmarked ? 'Saved' : 'Save'}
  {/snippet}
</Relay.BookmarkButton>

<!-- Custom element -->
<Relay.BookmarkButton {bookmarks}>
  {#snippet child({ props, isBookmarked })}
    <a {...props} href="#" class="bookmark-link">
      <Icon name={isBookmarked ? 'heart-filled' : 'heart'} />
    </a>
  {/snippet}
</Relay.BookmarkButton>`}
  </CodeBlock>

  <h3>3. Pure Display Pattern (No Snippets)</h3>

  <p>
    Use this pattern for simple display components that only render data without interaction or complex logic.
  </p>

  <h4>When to Use</h4>
  <ul>
    <li>Component only displays text or simple content</li>
    <li>No interaction needed</li>
    <li>No state management</li>
    <li>Styling via class prop is sufficient</li>
  </ul>

  <h4>Example Implementation</h4>

  <CodeBlock language="svelte">
{`<!-- user-name.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  const context = getContext<UserContext>(USER_CONTEXT_KEY);
  if (!context) {
    throw new Error('Must be used within User.Root');
  }

  const displayName = $derived(
    context.profile?.displayName ||
    context.profile?.name ||
    context.npub.substring(0, 8)
  );
</script>

<span class={className}>{displayName}</span>`}
  </CodeBlock>

  <h2>Key Principles</h2>

  <h3>1. No Hardcoded Styling</h3>

  <Alert type="warning">
    <strong>Never include:</strong>
    <ul>
      <li>Tailwind classes in component markup</li>
      <li>&lt;style&gt; blocks with visual styles</li>
      <li>Inline styles</li>
      <li>Hardcoded colors, sizes, or spacing</li>
    </ul>
  </Alert>

  <p>
    The only acceptable styling is structural CSS like <code>display: contents</code> that doesn't affect appearance.
  </p>

  <h3>2. Use mergeProps for Behavioral Components</h3>

  <p>
    When using the child snippet pattern, always merge user props with internal props to ensure both work correctly:
  </p>

  <CodeBlock language="svelte">
{`import { mergeProps } from '../utils.js';

const mergedProps = $derived(mergeProps(restProps, {
  onclick: handleClick,
  disabled: isDisabled,
  'aria-expanded': isOpen,
  class: className
}));`}
  </CodeBlock>

  <h3>3. Context for Shared State</h3>

  <p>
    Use Svelte's context API for sharing state between related components:
  </p>

  <CodeBlock language="svelte">
{`// In root component
const CONTEXT_KEY = Symbol('my-component');
setContext(CONTEXT_KEY, {
  get state() { return state; },
  get derived() { return derived; },
  method1,
  method2
});

// In child components
const context = getContext(CONTEXT_KEY);
if (!context) {
  throw new Error('Must be used within Root component');
}`}
  </CodeBlock>

  <h3>4. Snippet Props Typing</h3>

  <p>
    Always type your snippet parameters for better developer experience:
  </p>

  <CodeBlock language="typescript">
{`interface SnippetProps {
  isSelected: boolean;
  isLoading: boolean;
  count: number;
}

interface Props {
  // For behavioral components
  child?: Snippet<[{ props: any } & SnippetProps]>;

  // For data providers
  children?: Snippet<[SnippetProps]>;
}`}
  </CodeBlock>

  <h2>Component Structure</h2>

  <h3>File Organization</h3>

  <CodeBlock>
{`src/lib/registry/
├── ui/                    # Headless primitives
│   ├── user/
│   │   ├── index.ts       # Export namespace
│   │   ├── context.svelte.ts
│   │   ├── user-root.svelte
│   │   ├── user-avatar.svelte
│   │   └── user-name.svelte
│   └── relay/
│       ├── index.ts
│       ├── context.svelte.ts
│       └── relay-*.svelte
├── blocks/                # Composed, styled components
│   ├── user-card.svelte
│   └── relay-card.svelte
└── components/           # App-specific compositions
    └── custom-user-menu.svelte`}
  </CodeBlock>

  <h3>Index File Pattern</h3>

  <p>
    Export components as a namespace for better developer experience:
  </p>

  <CodeBlock language="typescript">
{`// index.ts
import Root from './user-root.svelte';
import Avatar from './user-avatar.svelte';
import Name from './user-name.svelte';

export const User = {
  Root,
  Avatar,
  Name
};

// Usage
import { User } from '$lib/registry/ui/user';

<User.Root {user}>
  <User.Avatar />
  <User.Name />
</User.Root>`}
  </CodeBlock>

  <h2>Migration Checklist</h2>

  <p>
    When refactoring existing components to be headless:
  </p>

  <ol>
    <li>
      <strong>Identify the pattern:</strong> Is it behavioral, data provider, or pure display?
    </li>
    <li>
      <strong>Remove all styling:</strong> Delete style blocks, remove Tailwind classes, remove inline styles
    </li>
    <li>
      <strong>Add appropriate snippets:</strong> Use <code>child</code> for behavioral, <code>children</code> for data/content
    </li>
    <li>
      <strong>Merge props correctly:</strong> Use mergeProps utility for behavioral components
    </li>
    <li>
      <strong>Type snippet props:</strong> Create interfaces for snippet parameters
    </li>
    <li>
      <strong>Update documentation:</strong> Add usage examples showing both default and custom usage
    </li>
    <li>
      <strong>Test flexibility:</strong> Ensure users can completely customize appearance and structure
    </li>
  </ol>

  <h2>Common Patterns</h2>

  <h3>Conditional Rendering with Data</h3>

  <CodeBlock language="svelte">
{`{#if data.length > 0}
  {@render children({ data })}
{/if}`}
  </CodeBlock>

  <h3>Default Fallback Content</h3>

  <CodeBlock language="svelte">
{`{#if children}
  {@render children(props)}
{:else}
  <span>{defaultText}</span>
{/if}`}
  </CodeBlock>

  <h3>Exposing Multiple States</h3>

  <CodeBlock language="svelte">
{`const snippetProps = $derived({
  isOpen,
  isLoading,
  isError,
  data,
  count: data.length
});

{@render children(snippetProps)}`}
  </CodeBlock>

  <h2>Testing Headless Components</h2>

  <p>
    A properly headless component should pass these tests:
  </p>

  <ul>
    <li>✅ Can render with completely custom markup</li>
    <li>✅ No styles leak when class prop is empty</li>
    <li>✅ All behavior works with custom elements</li>
    <li>✅ Props merge correctly without conflicts</li>
    <li>✅ Context errors are clear and helpful</li>
    <li>✅ TypeScript types are accurate and helpful</li>
  </ul>

  <Alert type="info">
    <strong>Remember:</strong> The goal is maximum flexibility. If users can't completely change how a component looks and behaves, it's not truly headless.
  </Alert>
  </section>
</div>