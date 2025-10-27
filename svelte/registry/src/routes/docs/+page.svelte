<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<div class="docs-page">
  <header class="docs-header">
    <h1>NDK-svelte Documentation</h1>
    <p class="subtitle">
      Build reactive Nostr applications with Svelte 5 and NDK
    </p>
  </header>

  <section class="intro-section">
    <h2>What is NDK-svelte?</h2>
    <p>
      NDK-svelte is a library for building Nostr applications with Svelte 5. It provides two complementary layers
      that work together to give you maximum flexibility:
    </p>
    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon">🏗️</div>
        <h3>Builders</h3>
        <p>
          Reactive state factories that handle data fetching, subscriptions, and Nostr protocol logic.
          Use them to build custom UIs from scratch.
        </p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🎨</div>
        <h3>Components</h3>
        <p>
          Beautiful, customizable UI components that copy into your project. Use them as starting points
          or reference implementations.
        </p>
      </div>
    </div>
  </section>

  <section class="why-section">
    <h2>Why NDK-svelte?</h2>
    <p>
      Building Nostr apps requires handling real-time subscriptions, profile fetching, engagement metrics,
      and more. NDK-svelte solves these problems so you can focus on your application's unique features.
    </p>

    <div class="benefit-list">
      <div class="benefit-item">
        <svg class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <div>
          <h4>Built for Svelte 5</h4>
          <p>Leverages runes ($state, $derived, $effect) for fine-grained reactivity</p>
        </div>
      </div>
      <div class="benefit-item">
        <svg class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <div>
          <h4>Real-time by Default</h4>
          <p>Automatic subscription management with live updates from Nostr relays</p>
        </div>
      </div>
      <div class="benefit-item">
        <svg class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <div>
          <h4>Performance Optimized</h4>
          <p>Request deduplication, lazy subscriptions, and smart caching built-in</p>
        </div>
      </div>
      <div class="benefit-item">
        <svg class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <div>
          <h4>Own Your Code</h4>
          <p>Components copy to your project - customize them however you want</p>
        </div>
      </div>
    </div>
  </section>

  <section class="quick-example">
    <h2>Quick Example</h2>
    <p>Here's how simple it is to display an event with engagement metrics:</p>

    <div class="code-example">
      <div class="code-header">
        <span>Using a Builder</span>
      </div>
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
    <span>{card.reactions.count} reactions</span>
  </footer>
</article>`}</code></pre>
    </div>

    <div class="code-example">
      <div class="code-header">
        <span>Using a Component</span>
      </div>
      <pre><code>{`<script>
  import { EventCard } from '$lib/components/ui/event-card';
</script>

<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
  <EventCard.Actions />
</EventCard.Root>`}</code></pre>
    </div>

    <p class="example-note">
      Both approaches give you reactive state and real-time updates. Choose based on how much customization you need.
    </p>
  </section>

  <section class="next-steps">
    <h2>Next Steps</h2>
    <div class="steps-grid">
      <a href="/docs/architecture" class="step-card">
        <h3>→ Understanding the Architecture</h3>
        <p>Learn how builders and components work together</p>
      </a>
      <a href="/docs/builders" class="step-card">
        <h3>→ Working with Builders</h3>
        <p>Build custom UIs with reactive state factories</p>
      </a>
      <a href="/docs/components" class="step-card">
        <h3>→ Working with Components</h3>
        <p>Customize and compose registry components</p>
      </a>
      <a href="/docs/guides" class="step-card">
        <h3>→ Practical Guides</h3>
        <p>Build a feed, threads, and more</p>
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
    line-height: 1.1;
  }

  .subtitle {
    font-size: 1.25rem;
    color: hsl(var(--color-muted-foreground));
    margin: 0;
    line-height: 1.6;
  }

  section {
    margin-bottom: 4rem;
  }

  h2 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 1.5rem 0;
    color: hsl(var(--color-foreground));
    letter-spacing: -0.025em;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: hsl(var(--color-foreground));
  }

  h4 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    color: hsl(var(--color-foreground));
  }

  p {
    font-size: 1rem;
    line-height: 1.7;
    color: hsl(var(--color-muted-foreground));
    margin: 0 0 1rem 0;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .feature-card {
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  .feature-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .feature-card h3 {
    margin-bottom: 0.75rem;
  }

  .feature-card p {
    margin: 0;
    font-size: 0.9375rem;
  }

  .benefit-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .benefit-item {
    display: flex;
    gap: 1rem;
    align-items: start;
  }

  .check-icon {
    width: 1.5rem;
    height: 1.5rem;
    flex-shrink: 0;
    color: hsl(142 76% 36%);
    margin-top: 0.125rem;
  }

  .benefit-item h4 {
    margin-bottom: 0.25rem;
  }

  .benefit-item p {
    margin: 0;
    font-size: 0.9375rem;
  }

  .code-example {
    margin: 1.5rem 0;
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .code-header {
    padding: 0.75rem 1rem;
    background: hsl(var(--color-muted));
    border-bottom: 1px solid hsl(var(--color-border));
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--color-foreground));
  }

  pre {
    margin: 0;
    padding: 1.5rem;
    background: hsl(var(--color-card));
    overflow-x: auto;
  }

  code {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.7;
    color: hsl(var(--color-foreground));
  }

  .example-note {
    font-size: 0.9375rem;
    font-style: italic;
    margin-top: 1rem;
  }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
  }

  .step-card {
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    text-decoration: none;
    transition: all 0.2s;
  }

  .step-card:hover {
    border-color: hsl(var(--color-primary));
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .step-card h3 {
    color: hsl(var(--color-primary));
    margin-bottom: 0.5rem;
  }

  .step-card p {
    margin: 0;
    font-size: 0.9375rem;
  }
</style>
