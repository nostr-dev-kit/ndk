<script lang="ts">
</script>

<div class="docs-page">
  <header class="docs-header">
    <h1>NDK-svelte</h1>
    <p class="subtitle">
      Reactive Nostr components and state management for Svelte 5
    </p>
  </header>

  <section>
    <h2>Overview</h2>
    <p>
      NDK-svelte provides two complementary layers for building Nostr applications:
    </p>

    <ul>
      <li><strong>Builders</strong> - Reactive state factories that handle subscriptions, data fetching, and Nostr protocol logic. Use them to build custom UIs.</li>
      <li><strong>Components</strong> - Pre-built UI templates that copy into your project. Customize or use as reference implementations.</li>
    </ul>

    <p>
      Both layers use Svelte 5 runes for fine-grained reactivity and provide automatic real-time updates from Nostr relays.
    </p>
  </section>

  <section>
    <h2>Quick Start</h2>

    <h3>Using Builders</h3>
    <pre><code>{`<script>
  import { createEventCard } from '@nostr-dev-kit/svelte';

  const card = createEventCard({ ndk, event: () => event });
</script>

<article>
  <img src={card.profile?.picture} alt="" />
  <h3>{card.profile?.displayName}</h3>
  <p>{event.content}</p>
  <footer>
    <span>{card.replies.count} replies</span>
    <span>{card.zaps.totalAmount} sats</span>
  </footer>
</article>`}</code></pre>

    <h3>Using Components</h3>
    <pre><code>{`<script>
  import { EventCard } from '$lib/components/ui/event-card';
</script>

<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
  <EventCard.Actions />
</EventCard.Root>`}</code></pre>
  </section>

  <section>
    <h2>When to Use Each</h2>
    <p>
      <strong>Start with components</strong> when you want working UI quickly or are building standard interfaces (feeds, profiles, cards).
      Components copy to your project, so you can edit them directly as your needs evolve.
    </p>
    <p>
      <strong>Start with builders</strong> when you need complete design control or are building unique interfaces.
      Builders give you reactive data without any UI opinions.
    </p>
    <p>
      You're not locked into either approach - components use builders internally, and you can always extract the builder
      from a component and replace the UI entirely.
    </p>
  </section>

  <section>
    <h2>Key Features</h2>
    <ul>
      <li><strong>Svelte 5 Runes</strong> - Built on <code>$state</code>, <code>$derived</code>, and <code>$effect</code> for optimal reactivity</li>
      <li><strong>Real-time Updates</strong> - Automatic subscription management with live data from Nostr relays</li>
      <li><strong>Performance Optimized</strong> - Request deduplication, lazy subscriptions, and smart caching</li>
      <li><strong>TypeScript Support</strong> - Full type definitions for all builders and components</li>
      <li><strong>Registry System</strong> - Components copy to your project via CLI (shadcn-style)</li>
    </ul>
  </section>

  <section class="next-section">
    <h2>Next Steps</h2>
    <div class="next-grid">
      <a href="/docs/architecture" class="next-card">
        <h3>Architecture</h3>
        <p>Understand how builders and components work together</p>
      </a>
      <a href="/docs/builders" class="next-card">
        <h3>Builders</h3>
        <p>Learn about reactive state factories</p>
      </a>
      <a href="/docs/components" class="next-card">
        <h3>Components</h3>
        <p>Customize and compose UI templates</p>
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
    color: hsl(var(--color-foreground));
    letter-spacing: -0.025em;
  }

  .subtitle {
    font-size: 1.25rem;
    color: hsl(var(--color-muted-foreground));
    margin: 0;
  }

  section {
    margin-bottom: 3rem;
  }

  h2 {
    font-size: 1.875rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: hsl(var(--color-foreground));
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 2rem 0 1rem 0;
    color: hsl(var(--color-foreground));
  }

  p {
    font-size: 1rem;
    line-height: 1.7;
    color: hsl(var(--color-muted-foreground));
    margin: 0 0 1rem 0;
  }

  ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
    color: hsl(var(--color-muted-foreground));
    line-height: 1.7;
  }

  li {
    margin-bottom: 0.5rem;
  }

  code {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
    font-size: 0.875rem;
    background: hsl(var(--color-muted));
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    color: hsl(var(--color-foreground));
  }

  pre {
    margin: 1rem 0;
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
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
    border-top: 1px solid hsl(var(--color-border));
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
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    text-decoration: none;
    transition: border-color 0.2s;
  }

  .next-card:hover {
    border-color: hsl(var(--color-primary));
  }

  .next-card h3 {
    margin: 0 0 0.5rem 0;
    color: hsl(var(--color-primary));
    font-size: 1.125rem;
  }

  .next-card p {
    margin: 0;
    font-size: 0.9375rem;
  }
</style>
