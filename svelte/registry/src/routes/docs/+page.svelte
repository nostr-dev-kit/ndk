<script lang="ts">
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import PageTitle from '$site-components/PageTitle.svelte';
  import "../../lib/styles/docs-page.css";
</script>

<PageTitle
  title="NDK-svelte"
  subtitle="Reactive Nostr components and state management for Svelte 5"
/>

<div class="docs-page">

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
    <CodeBlock lang="svelte" code={`<script>
  import { createEventContent } from '$lib/registry/builders';

  const content = createEventContent(() => ({ event }), ndk);
</script>

<article>
  {#each content.segments as segment}
    {#if segment.type === 'text'}
      <span>{segment.text}</span>
    {:else if segment.type === 'link'}
      <a href={segment.url}>{segment.text}</a>
    {/if}
  {/each}
</article>`} />

    <h3>Using Components</h3>
    <CodeBlock lang="svelte" code={`<script>
  import { EventCard } from '$lib/registry/components/event-card';
</script>

<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
  <EventCard.Actions />
</EventCard.Root>`} />
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
      <a href="/docs/utilities" class="next-card">
        <h3>Utilities</h3>
        <p>Helper functions for working with Nostr data</p>
      </a>
    </div>
  </section>
</div>
