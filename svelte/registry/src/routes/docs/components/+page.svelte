<script lang="ts">
</script>

<div class="docs-page">
  <header class="docs-header">
    <h1>Components</h1>
    <p class="subtitle">
      Understanding and customizing registry components
    </p>
  </header>

  <section>
    <h2>What Are Registry Components?</h2>
    <p>
      Registry components are templates that copy into your project, not dependencies locked in <code>node_modules</code>.
      Install them with <code>npx shadcn-svelte add event-card</code>, and the files copy to <code>src/lib/components/ui/</code>.
      You own the code and can modify it however you want.
    </p>

    <p>
      Think of them as curated examples of builder usage - starting templates for common UIs that you can
      customize or learn from.
    </p>
  </section>

  <section>
    <h2>Structure</h2>
    <p>
      Registry components follow a Root + Children pattern. The Root creates the builder and shares state via context.
      Children get the context and render UI.
    </p>

    <pre><code>{`<!-- event-card-root.svelte -->
<`+`script>
  import { setContext } from 'svelte';
  import { createEventCard } from '@nostr-dev-kit/svelte';

  let { ndk, event }: Props = $props();

  const state = createEventCard(() => ({ event }), ndk);

  setContext(EVENT_CARD_CONTEXT_KEY, {
    get ndk() { return ndk; },
    get event() { return event; },
    get state() { return state; }
  });
</`+`script>

<article>
  {@render children?.()}
</article>`}</code></pre>

    <pre><code>{`<!-- event-card-header.svelte -->
<`+`script>
  import { getContext } from 'svelte';

  const { event, state } = getContext(EVENT_CARD_CONTEXT_KEY);
</`+`script>

<header>
  <img src={state.profile?.picture} alt="" />
  <span>{event.created_at}</span>
</header>`}</code></pre>

    <pre><code>{`<!-- Usage -->
<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
  <EventCard.Actions />
</EventCard.Root>`}</code></pre>

    <p>
      Root creates the builder in one place. Context shares state with children. Children compose together as needed.
    </p>
  </section>

  <section>
    <h2>Customization</h2>
    <p>Since components copy to your project, you can customize at any level:</p>

    <h3>Edit the Files Directly</h3>
    <p>Open your copy and modify it.</p>

    <pre><code>{`<!-- Your copy at src/lib/components/ui/event-card/
     event-card-header.svelte -->
<`+`script>
  import { fade } from 'svelte/transition';
</`+`script>

<header transition:fade class="my-custom-styles">
  <div class="badge">Premium</div>
  <Avatar {ndk} user={event.author} />
</header>`}</code></pre>

    <h3>Mix Component Parts with Custom Parts</h3>
    <p>Use some registry parts, replace others with your own markup.</p>

    <pre><code>{`<EventCard.Root {ndk} {event}>
  <EventCard.Header />

  <!-- Custom content -->
  <div class="my-content">
    <p>{event.content}</p>
  </div>

  <EventCard.Actions />
</EventCard.Root>`}</code></pre>

    <h3>Extract the Builder</h3>
    <p>Keep the builder, replace all UI with your own design.</p>

    <pre><code>{`<`+`script>
  import { createEventCard } from '@nostr-dev-kit/svelte';

  const state = createEventCard(() => ({ event }), ndk);
</`+`script>

<div class="my-design">
  <h2>{state.profile?.displayName}</h2>
  <p>{event.content}</p>
  <footer>{state.replies.count} replies</footer>
</div>`}</code></pre>
  </section>

  <section>
    <h2>Building Custom Parts</h2>
    <p>
      You can build your own child components that access the same context.
    </p>

    <pre><code>{`<!-- my-custom-engagement.svelte -->
<`+`script>
  import { getContext } from 'svelte';
  import { EVENT_CARD_CONTEXT_KEY } from './context.svelte';

  const { state } = getContext(EVENT_CARD_CONTEXT_KEY);

  const engagementScore = $derived(
    state.replies.count +
    state.reactions.count +
    state.reposts.count
  );
</`+`script>

<div class="engagement">
  Score: {engagementScore}
</div>`}</code></pre>

    <pre><code>{`<!-- Use alongside registry parts -->
<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
  <MyCustomEngagement />
</EventCard.Root>`}</code></pre>
  </section>

  <section>
    <h2>Standalone Components</h2>
    <p>
      Some components work standalone or composed. They accept optional props and fall back to context if not provided.
    </p>

    <pre><code>{`<!-- Composed - gets data from context -->
<UserProfile.Root {ndk} {user}>
  <UserProfile.Avatar />
  <UserProfile.Name />
</UserProfile.Root>

<!-- Standalone - provide data directly -->
<UserProfile.Avatar {ndk} {user} size={64} />
<UserProfile.Name {ndk} {user} field="displayName" />`}</code></pre>

    <p>
      Check the component props - optional props mean it supports standalone usage and will fall back to context.
    </p>
  </section>

  <section class="next-section">
    <h2>Next Steps</h2>
    <div class="next-grid">
      <a href="/docs/guides" class="next-card">
        <h3>Guides</h3>
        <p>Build real features with builders and components</p>
      </a>
      <a href="/components/event-card" class="next-card">
        <h3>Browse Components</h3>
        <p>See all available registry components</p>
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
