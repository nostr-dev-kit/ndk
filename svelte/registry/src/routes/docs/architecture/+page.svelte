<script lang="ts">
  import CodeBlock from '$components/CodeBlock.svelte';
</script>

<div class="docs-page">
  <header class="docs-header">
    <h1>Architecture</h1>
    <p class="subtitle">
      How NDK-svelte separates data from presentation
    </p>
  </header>

  <section>
    <h2>Two Layers</h2>
    <p>
      NDK-svelte separates concerns into two layers: builders handle data fetching and subscriptions,
      while components handle presentation. This separation gives you flexibility - use builders for
      complete UI control, or use components for quick starts with sensible defaults.
    </p>

    <h3>Builders (Data Layer)</h3>
    <p>
      Builders are functions that return reactive state objects. They live in <code>node_modules</code>
      as part of the <code>@nostr-dev-kit/svelte</code> package. When you call <code>createEventCard()</code>,
      it sets up subscriptions to Nostr relays and returns an object with reactive getters for engagement metrics.
    </p>

    <CodeBlock lang="typescript" code={`import { createEventCard } from '@nostr-dev-kit/svelte';

const card = createEventCard(() => ({ event }), ndk);

// Access reactive state
card.replies.count
card.zaps.totalAmount
card.reactions.byEmoji`} />

    <h3>Components (UI Layer)</h3>
    <p>
      Components are Svelte files that copy into your project via CLI. They use builders internally
      but add opinionated styling and structure. Since they're in your codebase, you can edit them
      directly - change the HTML, add transitions, modify styling, or even extract just the builder
      and build your own UI from scratch.
    </p>

    <CodeBlock lang="svelte" code={`<!-- Copied to your project -->
<script>
  import { createEventCard } from '@nostr-dev-kit/svelte';
  const state = createEventCard(() => ({ event }), ndk);
</script>

<article>
  <!-- Your UI using builder state -->
  <span>{state.replies.count} replies</span>
</article>`} />
  </section>

  <section>
    <h2>Reactive State Flow</h2>
    <p>
      Here's what happens when you display an event with engagement metrics:
    </p>

    <ol>
      <li>Component calls builder: <code>createEventCard(() => ({"{event}"}), ndk)</code></li>
      <li>Builder creates subscriptions (lazy - only when you access getters)</li>
      <li>New data arrives from Nostr relays over websockets</li>
      <li>Builder updates reactive state automatically</li>
      <li>Svelte re-renders your UI with new values</li>
    </ol>

    <p>
      This happens continuously while your component is mounted. When you access <code>card.replies.count</code>,
      the builder subscribes to reply events. As new replies arrive, the count updates automatically.
    </p>
  </section>

  <section>
    <h2>Choosing Your Approach</h2>
    <p>
      <strong>Start with components</strong> when building standard interfaces or prototyping. Components provide
      working UI immediately and you can customize them by editing your copies.
    </p>

    <CodeBlock lang="bash" code={`npx shadcn-svelte add event-card`} />

    <CodeBlock lang="svelte" code={`<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
</EventCard.Root>`} />

    <p>
      <strong>Start with builders</strong> when you need custom designs or unique interactions. Builders give you
      reactive data without any UI opinions.
    </p>

    <CodeBlock lang="svelte" code={`import { createEventCard, createProfileFetcher } from '@nostr-dev-kit/svelte';

const card = createEventCard(() => ({ event }), ndk);
const profile = createProfileFetcher(() => ({ user: event.author }), ndk);

// Build your own UI
<div class="my-design">
  <img src={profile.profile?.picture} alt="" />
  <p>{event.content}</p>
  <span>{card.zaps.totalAmount} sats</span>
</div>`} />

    <p>
      You can always switch approaches. If you start with a component but later need more control,
      just keep the builder and replace the UI markup.
    </p>
  </section>

  <section>
    <h2>Why Functions for Props?</h2>
    <p>
      Builders take a function that returns props (<code>() => ({ event })</code>).
      This enables reactivity - when the input changes, the builder can clean up old subscriptions and create new ones.
    </p>

    <CodeBlock lang="typescript" code={`let currentEvent = $state(events[0]);

// ✅ Reacts when currentEvent changes
const card = createEventCard(() => ({ event: currentEvent }), ndk);

// When you update currentEvent, builder automatically:
// 1. Stops old subscriptions
// 2. Creates new subscriptions
// 3. Updates all state
currentEvent = events[1];`} />
  </section>

  <section class="next-section">
    <h2>Next Steps</h2>
    <div class="next-grid">
      <a href="/docs/builders" class="next-card">
        <h3>Builders</h3>
        <p>Learn about available builders and patterns</p>
      </a>
      <a href="/docs/components" class="next-card">
        <h3>Components</h3>
        <p>Customize and compose registry components</p>
      </a>
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
    margin: 2rem 0 1rem 0;
    color: var(--color-foreground);
  }

  p {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--color-muted-foreground);
    margin: 0 0 1rem 0;
  }

  ol {
    margin: 1rem 0;
    padding-left: 1.5rem;
    color: var(--color-muted-foreground);
    line-height: 1.7;
  }

  li {
    margin-bottom: 0.5rem;
  }

  code {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
    font-size: 0.875rem;
    background: var(--color-muted);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    color: var(--color-foreground);
  }

  pre {
    margin: 1rem 0;
    padding: 1.5rem;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  pre code {
    background: none;
    padding: 0;
    line-height: 1.7;
    display: block;
  }

  .next-section {
    border-top: 1px solid var(--color-border);
    padding-top: 3rem;
  }

  .next-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .next-card {
    padding: 1.5rem;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    text-decoration: none;
    transition: border-color 0.2s;
  }

  .next-card:hover {
    border-color: var(--color-primary);
  }

  .next-card h3 {
    margin: 0 0 0.5rem 0;
    color: var(--color-primary);
    font-size: 1.125rem;
  }

  .next-card p {
    margin: 0;
    font-size: 0.9375rem;
  }
</style>
